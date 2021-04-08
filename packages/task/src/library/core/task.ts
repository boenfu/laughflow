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

export type TaskLeafId = Nominal<string, 'task-leaf:id'>;

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
  nodes: (TaskNodeMetadata | TaskBranchesNodeMetadata)[];
}

export interface ITaskNodeMetadata
  extends Magicflow.TaskNodeMetadataExtension,
    IOutputsEntity {
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
  nexts?: (TaskNodeMetadata | TaskBranchesNodeMetadata)[];
}

export interface TaskNodeMetadata extends ITaskNodeMetadata {
  type: 'singleNode';
}

export interface TaskBranchesNodeMetadata extends ITaskNodeMetadata {
  type: 'branchesNode';
  flows: TaskFlowMetadata[];
}
