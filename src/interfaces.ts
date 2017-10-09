import {ExecutionContext} from '@essential-projects/core_contracts';
import {IMessage} from '@essential-projects/messagebus_contracts';
import {IMessageBusService} from '@essential-projects/messagebus_contracts/src/interfaces';
import {IBoundaryEventEntity, INodeDefEntity, IUserTaskEntity} from '@process-engine/process_engine_contracts';

export interface IProcessable {
  handleUserTask(processInstance: IProcessInstance, uiName: string, uiConfig: any, uiData?: any): void;
  handleManualTask(processInstance: IProcessInstance, uiName: string, uiConfig: any, uiData?: any): void;
  handleEndEvent(processInstance: IProcessInstance, endEventData?: any): void;
  handleEvent(processInstance: IProcessInstance, eventType: string, eventData?: any): void;
  handleCancel(processInstance: IProcessInstance): void;
}

export interface IProcessInstance {
  readonly messageBusService: IMessageBusService;
  readonly processKey: string;
  readonly processable: IProcessable;
  readonly participantId: string;
  readonly tokenData: any;

  nextTaskDef: INodeDefEntity;
  nextTaskEntity: IUserTaskEntity;
  taskChannelName: string;

  start(context: ExecutionContext, token?: any): Promise<IProcessInstance>;
  stop(): Promise<void>;
  restart(context: ExecutionContext, token?: any): Promise<void>;

  doCancel(context: ExecutionContext): Promise<void>;
  doProceed(context: ExecutionContext): Promise<void>;
  doError(context: ExecutionContext, error?: any): Promise<void>;
  doEvent(context: ExecutionContext, eventData?: any): Promise<void>;
}

export interface IProcessEngineClientApi {
  startProcess(processKey: string, processable: IProcessable, context: ExecutionContext, token?: any): Promise<IProcessInstance>;
}
