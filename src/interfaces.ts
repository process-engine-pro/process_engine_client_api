import {ExecutionContext} from '@process-engine-js/core_contracts';
import {IMessage} from '@process-engine-js/messagebus_contracts';
import {INodeDefEntity, IUserTaskEntity} from '@process-engine-js/process_engine_contracts';
import {IMessageBusService} from '@process-engine-js/messagebus_contracts/src/interfaces';

export interface IProcessable {
  handleUserTask(processInstance: IProcessInstance, uiName: string, uiConfig: any, uiData?: any): void;
  handleManualTask(processInstance: IProcessInstance, uiName: string, uiConfig: any, uiData?: any): void;
  handleEndEvent(processInstance: IProcessInstance, endEventData?: any): void;
}

export interface IProcessInstance {
  messageBusService: IMessageBusService;
  processKey: string;
  processable: IProcessable;

  nextTaskDef: INodeDefEntity;
  nextTaskEntity: IUserTaskEntity;
  taskChannelName: string;

  start(context?: ExecutionContext): Promise<IProcessInstance>;
  stop(): Promise<void>;
  restart(context?: ExecutionContext): Promise<void>;

  doCancel(context: ExecutionContext): Promise<void>;
  doProceed(context: ExecutionContext): Promise<void>;
}

export interface IProcessEngineClientApi {
  startProcess(processKey: string, processable: IProcessable, context: ExecutionContext, token?: any): Promise<IProcessInstance>;
}
