import { IMessageBusService } from '@process-engine-js/messagebus_contracts';
import { IProcessable, IProcessInstance } from './interfaces';
import { ExecutionContext } from '@process-engine-js/core_contracts';
import { NodeDefEntity, UserTaskEntity } from '@process-engine-js/process_engine';
export declare class ProcessInstance implements IProcessInstance {
    private _messageBusService;
    private _processKey;
    private _processable;
    private _participantSubscription;
    private _nextTaskDef;
    private _nextTaskEntity;
    private _taskChannelName;
    private _context;
    constructor(processKey: string, messageBusService: IMessageBusService, processable: IProcessable);
    private readonly messageBusService;
    readonly processable: IProcessable;
    readonly processKey: string;
    nextTaskDef: NodeDefEntity;
    nextTaskEntity: UserTaskEntity;
    taskChannelName: string;
    start(context?: ExecutionContext): Promise<IProcessInstance>;
    stop(): Promise<void>;
    restart(context?: ExecutionContext): Promise<void>;
    doCancel(): Promise<void>;
    doProceed(tokenData?: any): Promise<void>;
}
