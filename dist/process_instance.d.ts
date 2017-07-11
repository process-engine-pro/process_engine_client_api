import { IMessageBusService } from '@process-engine-js/messagebus_contracts';
import { IProcessable, IProcessInstance } from './interfaces';
import { ExecutionContext } from '@process-engine-js/core_contracts';
import { INodeDefEntity, IUserTaskEntity } from '@process-engine-js/process_engine_contracts';
export declare class ProcessInstance implements IProcessInstance {
    private _messageBusService;
    private _processKey;
    private _processable;
    private _participantSubscription;
    private _nextTaskDef;
    private _nextTaskEntity;
    private _taskChannelName;
    private _context;
    private _participantId;
    constructor(processKey: string, messageBusService: IMessageBusService, processable: IProcessable);
    private readonly messageBusService;
    readonly processable: IProcessable;
    readonly processKey: string;
    nextTaskDef: INodeDefEntity;
    nextTaskEntity: IUserTaskEntity;
    taskChannelName: string;
    readonly participantId: string;
    start(token?: any, context?: ExecutionContext): Promise<IProcessInstance>;
    stop(): Promise<void>;
    restart(context?: ExecutionContext): Promise<void>;
    doCancel(): Promise<void>;
    doProceed(tokenData?: any): Promise<void>;
}
