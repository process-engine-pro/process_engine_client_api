import { ExecutionContext } from '@process-engine-js/core_contracts';
import { IMessage } from '@process-engine-js/messagebus_contracts';
export interface IProcessable {
    handleUserTask(message: IMessage): any;
    handleManualTask(message: IMessage): any;
    handleEndEvent(message: IMessage): any;
}
export interface IProcessInstance {
    start(context?: ExecutionContext): Promise<IProcessInstance>;
    stop(): Promise<boolean>;
    restart(context?: ExecutionContext): Promise<boolean>;
}
export interface IProcessEngineClientApi {
    startProcess(processKey: string, processable: IProcessable, context?: ExecutionContext): Promise<IProcessInstance>;
}
