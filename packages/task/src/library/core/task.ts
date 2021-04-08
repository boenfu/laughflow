import {FlowId, LeafId, NodeId, NodeType, ProcedureId} from '@magicflow/core';
import {Dict, Nominal} from 'tslang';

export type TaskId = Nominal<string, 'task:id'>;

export type TaskNodeId = Nominal<string, 'task-node:id'>;

export type TaskFlowId = Nominal<string, 'task-flow:id'>;

export type TaskLeafId = Nominal<string, 'task-leaf:id'>;

export type TaskStage = 'none' | 'in-progress' | 'done' | 'terminated';

export type TaskNodeStage = TaskStage;

export interface IOutputsResource {
  outputs?: Dict<any>;
}

export interface TaskMetadata
  extends Magicflow.TaskMetadataExtension,
    IOutputsResource {
  id: TaskId;
  definition: ProcedureId;
  stage: TaskStage;
  start: TaskFlowMetadata;
}

export interface TaskFlowMetadata
  extends Magicflow.TaskFlowMetadataExtension,
    IOutputsResource {
  id: TaskFlowId;
  definition: FlowId;
  stage: TaskStage;
  nodes: (TaskNodeMetadata | TaskBranchesNodeMetadata)[];
}

export interface ITaskNodeMetadata
  extends Magicflow.TaskNodeMetadataExtension,
    IOutputsResource {
  id: TaskNodeId;
  definition: NodeId;
  type: NodeType;
  stage: TaskNodeStage;

  /**
   * 将不进入节点
   */
  broken?: boolean;
  /**
   * 将跳过节点执行之后节点
   */
  ignored?: boolean;

  leaves?: TaskLeafMetadata[];
  nexts?: (TaskNodeMetadata | TaskBranchesNodeMetadata)[];
}

export interface TaskNodeMetadata extends ITaskNodeMetadata {
  type: 'node';
}

export interface TaskBranchesNodeMetadata extends ITaskNodeMetadata {
  type: 'branchesNode';
  flows: TaskFlowMetadata[];
}

export interface TaskLeafMetadata extends Magicflow.TaskLeafMetadataExtension {
  id: TaskLeafId;
  definition: LeafId;
}
