import {IMessageBusService, IMessageSubscription} from '@process-engine-js/messagebus_contracts';
import {IProcessable, IProcessEngineClientApi, IProcessInstance} from './interfaces';
import {ExecutionContext} from '@process-engine-js/core_contracts';

export class ProcessInstance implements IProcessInstance {
  private _messageBusService: IMessageBusService = undefined;
  private _processKey: string = undefined;
  private _processable: IProcessable = undefined;
  private _participantSubscription: IMessageSubscription = undefined;

  constructor(processKey: string, messageBusService: IMessageBusService, processable: IProcessable) {
    this._messageBusService = messageBusService;
    this._processKey = processKey;
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

  public async start(context?: ExecutionContext): Promise<IProcessInstance> {
    // Build message for starting a process
    const msg = this.messageBusService.createDataMessage(
      {
        action: 'start',
        key: this.processKey
      },
      context
    );
    this.messageBusService.publish('/processengine', msg);
    const participantChannelName = '/participant/' + msg.metadata.applicationId;

    // subscribe to channel and forward to processable implementation in order to handle UserTasks/ManualTasks/EndEvents
    this._participantSubscription = await this.messageBusService.subscribe(participantChannelName, async (message) => {
      if (message && message.data && message.data.action) {
        switch (message.data.action) {
          case 'userTask':
            this.processable.handleUserTask(message);
            break;
          case 'manualTask':
            this.processable.handleManualTask(message);
            break;
          case 'endEvent':
            this._participantSubscription.cancel();
            await this.processable.handleEndEvent(message);
            break;
        }
      }
    });

    return this;
  }

  public async stop(): Promise<boolean> {
    await this._participantSubscription.cancel();
    return true;
  }

  public async restart(context?: ExecutionContext): Promise<boolean> {
    await this.stop();
    await this.start(context);
    return true;
  }
}
