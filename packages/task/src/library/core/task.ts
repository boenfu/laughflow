import {FlowId, JointId, NodeId} from '@magicflow/core';
import {Dict, Nominal} from 'tslang';

export type TaskId = Nominal<string, 'task:id'>;

export type TaskNodeId = Nominal<string, 'task-node:id'>;
export type TaskJointId = Nominal<string, 'task-joint:id'>;

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
  definition: FlowId;
  stage: TaskStage;

  startIds: TaskNodeId[];
  nodes: TaskNodeMetadata[];
}

export type TaskNodeNextMetadata =
  | TaskNodeNextNodeMetadata
  | TaskJointNextNodeMetadata;

export interface TaskNodeNextNodeMetadata {
  type: 'node';
  id: TaskNodeId;
}

export interface TaskJointNextNodeMetadata {
  type: 'joint';
  id: TaskJointId;
}

export interface TaskNodeMetadata
  extends Magicflow.TaskNodeMetadataExtension,
    IOutputsResource {
  id: TaskNodeId;
  definition: NodeId;
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
  nexts?: TaskNodeNextMetadata[];
}

export interface TaskJointMetadata
  extends Magicflow.TaskJointMetadataExtension,
    IOutputsResource {
  id: TaskJointId;
  definition: JointId;
}

export interface TaskLeafMetadata extends Magicflow.TaskLeafMetadataExtension {
  id: TaskJointId;
  definition: JointId;
}
