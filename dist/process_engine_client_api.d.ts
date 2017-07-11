import { IMessageBusService } from '@process-engine-js/messagebus_contracts';
import { IProcessable, IProcessEngineClientApi, IProcessInstance } from './interfaces';
import { ExecutionContext } from '@process-engine-js/core_contracts';
export declare class ProcessEngineClientApi implements IProcessEngineClientApi {
    private _messageBusService;
    config: any;
    constructor(messageBusService: IMessageBusService);
    readonly messageBusService: IMessageBusService;
    startProcess(processKey: string, processable: IProcessable, context: ExecutionContext, token?: any): Promise<IProcessInstance>;
}
