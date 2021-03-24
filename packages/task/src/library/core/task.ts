import {JointId, NodeId, ProcedureId} from '@magicflow/core';
import {Nominal} from 'tslang';

export type TaskId = Nominal<string, 'task:id'>;

export type TaskNodeId = Nominal<string, 'task-node:id'>;
export type TaskJointId = Nominal<string, 'task-joint:id'>;
export type TaskLeafId = Nominal<string, 'task-leaf:id'>;

export type TaskStage = 'none' | 'in-progress' | 'done' | 'terminated';
export type TaskNodeStage = 'none' | 'in-progress' | 'done' | 'terminated';

export interface TaskMetadata extends Magicflow.TaskMetadataExtension {
  id: TaskId;
  definition: ProcedureId;

  startNode: TaskNodeId;
  stage?: TaskStage;

  nodes: TaskNodeMetadata[];
}

export type TaskNodeNextMetadata =
  | TaskNodeNextNodeMetadata
  | TaskNodeNextLeafMetadata
  | TaskJointNextNodeMetadata;

export interface TaskNodeNextNodeMetadata {
  type: 'node';
  id: TaskNodeId;
}

export interface TaskJointNextNodeMetadata {
  type: 'joint';
  id: TaskJointId;
}

export interface TaskNodeNextLeafMetadata {
  type: 'leaf';
  id: TaskLeafId;
}

export interface TaskNodeMetadata extends Magicflow.TaskNodeMetadataExtension {
  id: TaskNodeId;
  definition: NodeId;
  stage?: TaskNodeStage;

  nexts?: TaskNodeNextMetadata[];
}

export interface TaskJointMetadata
  extends Magicflow.TaskJointMetadataExtension {
  id: TaskJointId;
  definition: JointId;
}
