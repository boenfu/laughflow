import {
  FlowId,
  IOutputsEntity,
  NodeId,
  NodeType,
  ProcedureId,
} from '@magicflow/core';
import {Nominal} from 'tslang';

export type TaskId = Nominal<string, 'task:id'>;
export type TaskNodeId = Nominal<string, 'task-node:id'>;
export type TaskFlowId = Nominal<string, 'task-flow:id'>;

export type TaskStage = 'none' | 'in-progress' | 'done' | 'terminated';

export interface TaskMetadata
  extends Magicflow.TaskMetadataExtension,
    IOutputsEntity {
  id: TaskId;
  definition: ProcedureId;
  stage: TaskStage;
  start: TaskFlowMetadata;
}

export interface TaskFlowMetadata
  extends Magicflow.TaskFlowMetadataExtension,
    IOutputsEntity {
  id: TaskFlowId;
  definition: FlowId;
  stage: TaskStage;
  starts: TaskNodeMetadata[];
}

export type TaskNodeMetadata =
  | TaskSingleNodeMetadata
  | TaskBranchesNodeMetadata;

export interface ITaskNodeMetadata extends IOutputsEntity {
  id: TaskNodeId;
  definition: NodeId;
  type: NodeType;
  stage: TaskStage;

  /**
   * 将不进入节点
   */
  broken?: boolean;
  /**
   * 将跳过节点执行之后节点
   */
  ignored?: boolean;
  nexts?: TaskNodeMetadata[];
}

export interface TaskSingleNodeMetadata
  extends ITaskNodeMetadata,
    Magicflow.TaskSingleNodeMetadataExtension {
  type: 'singleNode';
}

export interface TaskBranchesNodeMetadata
  extends ITaskNodeMetadata,
    Magicflow.TaskBranchesNodeMetadataExtension {
  type: 'branchesNode';
  flows: TaskFlowMetadata[];
}
