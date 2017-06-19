import {IMessageBusService} from '@process-engine-js/messagebus_contracts';
import {IProcessable, IProcessEngineClientApi, IProcessInstance} from './interfaces';
import {ExecutionContext} from '@process-engine-js/core_contracts';
import {ProcessInstance} from './process_instance';

export class ProcessEngineClientApi implements IProcessEngineClientApi {
  private _messageBusService: IMessageBusService = undefined;

  public config: any = undefined;

  constructor(messageBusService: IMessageBusService) {
    this._messageBusService = messageBusService;
  }

  public get messageBusService(): IMessageBusService {
    return this._messageBusService;
  }

  public async startProcess(processKey: string, processable: IProcessable, context?: ExecutionContext): Promise<IProcessInstance> {
    const processInstance = new ProcessInstance(processKey, this.messageBusService, processable);

    await processInstance.start(context);

    return processInstance;
  }
}
