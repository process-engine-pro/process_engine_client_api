import { IMessageBusService } from '@process-engine-js/messagebus_contracts';
import { IProcessable, IProcessInstance } from './interfaces';
import { ExecutionContext } from '@process-engine-js/core_contracts';
export declare class ProcessInstance implements IProcessInstance {
    private _messageBusService;
    private _processKey;
    private _processable;
    private _participantSubscription;
    constructor(processKey: string, messageBusService: IMessageBusService, processable: IProcessable);
    private readonly messageBusService;
    readonly processable: IProcessable;
    readonly processKey: string;
    start(context?: ExecutionContext): Promise<IProcessInstance>;
    stop(): Promise<boolean>;
    restart(context?: ExecutionContext): Promise<boolean>;
}
