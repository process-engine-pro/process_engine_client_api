import {ExecutionContext} from '@process-engine-js/core_contracts';
import {IMessage} from '@process-engine-js/messagebus_contracts';
import {INodeDefEntity, IUserTaskEntity} from '@process-engine-js/process_engine_contracts';

export interface IProcessable {
  handleUserTask(processKey: string, message: IMessage): void;
  handleManualTask(processKey: string, message: IMessage): void;
  handleEndEvent(processKey: string, message: IMessage): void;
}

export interface IProcessInstance {
  nextTaskDef: INodeDefEntity;
  nextTaskEntity: IUserTaskEntity;
  taskChannelName: string;

  start(context?: ExecutionContext): Promise<IProcessInstance>;
  stop(): Promise<void>;
  restart(context?: ExecutionContext): Promise<void>;

  doCancel(context: ExecutionContext): Promise<void>;
  doProceed(context: ExecutionContext, tokenData?: any): Promise<void>;
}

export interface IProcessEngineClientApi {
  startProcess(processKey: string, processable: IProcessable, context: ExecutionContext, token?: any): Promise<IProcessInstance>;
}
