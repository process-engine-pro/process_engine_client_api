import { ExecutionContext } from '@process-engine-js/core_contracts';
import { IMessage } from '@process-engine-js/messagebus_contracts';
import { NodeDefEntity, UserTaskEntity } from '@process-engine-js/process_engine';
export interface IProcessable {
    handleUserTask(processKey: string, message: IMessage): void;
    handleManualTask(processKey: string, message: IMessage): void;
    handleEndEvent(processKey: string, message: IMessage): void;
}
export interface IProcessInstance {
    nextTaskDef: NodeDefEntity;
    nextTaskEntity: UserTaskEntity;
    taskChannelName: string;
    start(context?: ExecutionContext): Promise<IProcessInstance>;
    stop(): Promise<void>;
    restart(context?: ExecutionContext): Promise<void>;
    doCancel(): Promise<void>;
    doProceed(tokenData?: any): Promise<void>;
}
export interface IProcessEngineClientApi {
    startProcess(processKey: string, processable: IProcessable, context?: ExecutionContext): Promise<IProcessInstance>;
}
