import {IMessageBusService, IMessageSubscription} from '@process-engine-js/messagebus_contracts';
import {IProcessable, IProcessInstance} from './interfaces';
import {ExecutionContext} from '@process-engine-js/core_contracts';
import {INodeDefEntity, IUserTaskEntity, IUserTaskMessageData} from '@process-engine-js/process_engine_contracts';
import * as uuid from 'uuid';

export class ProcessInstance implements IProcessInstance {
  private _messageBusService: IMessageBusService = undefined;
  private _processKey: string = undefined;
  private _processable: IProcessable = undefined;
  private _participantSubscription: IMessageSubscription = undefined;

  private _nextTaskDef: INodeDefEntity = undefined;
  private _nextTaskEntity: IUserTaskEntity = undefined;
  private _taskChannelName: string = undefined;

  private _tokenData: any = undefined;
  private _participantId: string = undefined;

  private _eventSubscription: IMessageSubscription = undefined;
  private _eventChannelName: string = undefined;

  constructor(processKey: string, messageBusService: IMessageBusService, processable: IProcessable) {
    this._messageBusService = messageBusService;
    this._processKey = processKey;
    this._processable = processable;

    this._participantId = uuid.v4();
  }

  public get messageBusService(): IMessageBusService {
    return this._messageBusService;
  }

  public get processable(): IProcessable {
    return this._processable;
  }

  public get processKey(): string {
    return this._processKey;
  }

  public get nextTaskDef(): INodeDefEntity {
    return this._nextTaskDef;
  }

  public set nextTaskDef(nextTaskDef: INodeDefEntity) {
    this._nextTaskDef = nextTaskDef;
  }

  public get nextTaskEntity(): IUserTaskEntity {
    return this._nextTaskEntity;
  }

  public set nextTaskEntity(nextTaskEntity: IUserTaskEntity) {
    this._nextTaskEntity = nextTaskEntity;
  }

  public get taskChannelName(): string {
    return this._taskChannelName;
  }

  public set taskChannelName(taskChannelName: string) {
    this._taskChannelName = taskChannelName;
  }

  public get eventChannelName(): string {
    return this._eventChannelName;
  }

  public get participantId(): string {
    return this._participantId;
  }

  public get tokenData(): any {
    return this._tokenData;
  }

  public async start(context: ExecutionContext, token?: any): Promise<IProcessInstance> {
    // Build message for starting a process
    const msg = this.messageBusService.createDataMessage(
      {
        action: 'start',
        key: this.processKey,
        token
      },
      context,
      {
        participantId: this.participantId
      }
    );
    this.messageBusService.publish('/processengine', msg);
    const participantChannelName = '/participant/' + this.participantId;
    // const participantChannelName = '/participant/' + msg.metadata.applicationId;

    // subscribe to channel and forward to processable implementation in order to handle UserTasks/ManualTasks/EndEvents
    this._participantSubscription = await this.messageBusService.subscribe(participantChannelName, async (message) => {
      if (!this.processable) {
        throw new Error('no processable defined to handle activities!');
      } else if (message && message.data && message.data.action) {
        const setNewTask = async (taskMessageData) => {
          this.nextTaskDef = taskMessageData.userTaskEntity.nodeDef;
          this.nextTaskEntity = taskMessageData.userTaskEntity;
          this.taskChannelName = '/processengine/node/' + this.nextTaskEntity.id;

          this._eventChannelName = '/processengine_api/event/' + this.nextTaskEntity.id;
          this._eventSubscription = await this.messageBusService.subscribe(this.eventChannelName, async (message) => {
            switch (message.data.action) {
              case 'event':
                const eventType = message.data.eventType;
                const eventData = message.data.data || {};

                switch (eventType) {
                  case 'cancel':
                    await this.processable.handleCancel(this);
                    break;

                  default:
                    this._tokenData.current = eventData;
                    await this.processable.handleEvent(this, eventType, eventData);
                    break;
                }
            }

          });
        };

        switch (message.data.action) {
          case 'userTask':
            const userTaskMessageData = (<IUserTaskMessageData> message.data.data);

            setNewTask(userTaskMessageData);
            const uiName = message.data.data.uiName;
            const uiConfig = message.data.data.uiConfig;
            this._tokenData = message.data.data.uiData || {};
            this.processable.handleUserTask(this, uiName, uiConfig, this._tokenData);
            break;
          case 'manualTask':
            const manualTaskMessageData = (<IUserTaskMessageData> message.data.data);

            setNewTask(manualTaskMessageData);
            const taskName = message.data.data.uiName;
            const taskConfig = message.data.data.uiConfig;
            this._tokenData = message.data.data.uiData || {};

            this.processable.handleManualTask(this, taskName, taskConfig, this._tokenData);
            break;
          case 'endEvent':
            this._tokenData = message.data.data || {};

            await this.processable.handleEndEvent(this, this._tokenData);
            await this.stop();
            break;
        }
      }
    });

    return this;
  }

  public async stop(): Promise<void> {
    this.nextTaskDef = null;
    this.nextTaskEntity = null;
    this.taskChannelName = null;

    this._tokenData = null;

    await this._participantSubscription.cancel();

    return;
  }

  public async restart(context: ExecutionContext, token?: any): Promise<void> {
    await this.stop();
    await this.start(context, token);

    return;
  }

  public async doCancel(context: ExecutionContext): Promise<void> {
    const msg = this.messageBusService.createDataMessage(
      {
        action: 'event',
        eventType: 'cancel',
        data: this._tokenData
      },
      context,
      {
        participantId: this.participantId
      }
    );

    await this.messageBusService.publish(this.taskChannelName, msg);

    return;
  }

  public async doEvent(context: ExecutionContext, eventData?: any): Promise<void> {
    const msg = this.messageBusService.createDataMessage(
      {
        action: 'event',
        eventType: 'data',
        data: eventData
      },
      context,
      {
        participantId: this.participantId
      }
    );

    await this.messageBusService.publish(this.taskChannelName, msg);

    return;
  }

  public async doError(context: ExecutionContext, error: any): Promise<void> {
    const msg = this.messageBusService.createDataMessage(
      {
        action: 'event',
        eventType: 'error',
        data: error
      },
      context,
      {
        participantId: this.participantId
      }
    );

    await this.messageBusService.publish(this.taskChannelName, msg);

    return;
  }

  public async doProceed(context: ExecutionContext): Promise<void> {
    const msg = this.messageBusService.createDataMessage(
      {
        action: 'proceed',
        token: this._tokenData
      },
      context,
      {
        participantId: this.participantId
      }
    );

    await this.messageBusService.publish(this.taskChannelName, msg);

    return;
  }
}
