import {IMessageBusService, IMessageSubscription} from '@process-engine-js/messagebus_contracts';
import {IProcessable, IProcessInstance} from './interfaces';
import {ExecutionContext} from '@process-engine-js/core_contracts';
import {NodeDefEntity, UserTaskEntity} from '@process-engine-js/process_engine';

export class ProcessInstance implements IProcessInstance {
  private _messageBusService: IMessageBusService = undefined;
  private _processKey: string = undefined;
  private _processable: IProcessable = undefined;
  private _participantSubscription: IMessageSubscription = undefined;

  private _nextTaskDef: NodeDefEntity = undefined;
  private _nextTaskEntity: UserTaskEntity = undefined;
  private _taskChannelName: string = undefined;

  private _context: ExecutionContext = undefined;

  constructor(processKey: string, messageBusService: IMessageBusService, processable: IProcessable) {
    this._messageBusService = messageBusService;
    this._processKey = processKey;
    this._processable = processable;
  }

  private get messageBusService(): IMessageBusService {
    return this._messageBusService;
  }

  public get processable(): IProcessable {
    return this._processable;
  }

  public get processKey(): string {
    return this._processKey;
  }

  public get nextTaskDef(): NodeDefEntity {
    return this._nextTaskDef;
  }

  public set nextTaskDef(nextTaskDef: NodeDefEntity) {
    this._nextTaskDef = nextTaskDef;
  }

  public get nextTaskEntity(): UserTaskEntity {
  return this._nextTaskEntity;
}

  public set nextTaskEntity(nextTaskEntity: UserTaskEntity) {
    this._nextTaskEntity = nextTaskEntity;
  }

  public get taskChannelName(): string {
    return this._taskChannelName;
  }

  public set taskChannelName(taskChannelName: string) {
    this._taskChannelName = taskChannelName;
  }

  public async start(context?: ExecutionContext): Promise<IProcessInstance> {
    // Build message for starting a process
    this._context = context;
    const msg = this.messageBusService.createDataMessage(
      {
        action: 'start',
        key: this.processKey
      },
      this._context
    );
    this.messageBusService.publish('/processengine', msg);
    const participantChannelName = '/participant/' + msg.metadata.applicationId;

    // subscribe to channel and forward to processable implementation in order to handle UserTasks/ManualTasks/EndEvents
    this._participantSubscription = await this.messageBusService.subscribe(participantChannelName, async (message) => {
      if (!this.processable) {
        throw new Error('no processable defined to handle activities!');
      } else if (message && message.data && message.data.action) {
        this.nextTaskDef = message.data.data.nodeDef;
        this.nextTaskEntity = message.data.data;
        this.taskChannelName = '/processengine/node/' + this.nextTaskEntity.id;

        switch (message.data.action) {
          case 'userTask':
            this.processable.handleUserTask(message);
            break;
          case 'manualTask':
            this.processable.handleManualTask(message);
            break;
          case 'endEvent':
            await this.processable.handleEndEvent(message);
            await this.stop();
            break;
        }
      }
    });

    return this;
  }

  public async stop(): Promise<void> {
    await this._participantSubscription.cancel();

    return;
  }

  public async restart(context?: ExecutionContext): Promise<void> {
    await this.stop();
    await this.start(context);

    return;
  }

  public async doCancel(): Promise<void> {
    const msg = this.messageBusService.createDataMessage(
      {
        action: 'cancel'
      },
      this._context
    );

    await this.messageBusService.publish(this.taskChannelName, msg);

    return;
  }

  public async doProceed(tokenData?: any): Promise<void> {
    const msg = this.messageBusService.createDataMessage(
      {
        action: 'proceed',
        token: tokenData
      },
      this._context
    );

    await this.messageBusService.publish(this.taskChannelName, msg);

    return;
  }
}
