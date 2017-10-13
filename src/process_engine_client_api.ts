import {ExecutionContext} from '@essential-projects/core_contracts';
import {IMessageBusService} from '@essential-projects/messagebus_contracts';
import {IUserTaskEntity} from '@process-engine/process_engine_contracts';
import {IProcessable, IProcessEngineClientApi, IProcessInstance} from './interfaces';
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

  public async startProcess(processKey: string,
                            processable: IProcessable,
                            context: ExecutionContext,
                            token?: any): Promise<IProcessInstance> {
    const processInstance = new ProcessInstance(processKey, this.messageBusService, processable);

    return processInstance.start(context, token);
  }

  public async continueProcess(processKey: string,
                               processable: IProcessable,
                               userTaskEntity: IUserTaskEntity,
                               context: ExecutionContext): Promise<IProcessInstance> {
    const processInstance = new ProcessInstance(processKey, this.messageBusService, processable);

    return processInstance.continueProcess(userTaskEntity, context);
  }
}
