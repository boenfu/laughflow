import {LeafId, NodeId, ProcedureId} from '@magicflow/core';
import {Nominal} from 'tslang';

export type TaskId = Nominal<string, 'task:id'>;
export type TaskNodeId = Nominal<string, 'task-node:id'>;
export type TaskLeafId = Nominal<string, 'task-leaf:id'>;

export type TaskStage = 'none' | 'in-progress' | 'done' | 'terminated';
export type TaskNodeStage = 'none' | 'in-progress' | 'done';

export interface TaskMetadata {
  id: TaskId;
  definition: ProcedureId;

  startNode: TaskNodeId;
  stage?: TaskStage;

  nodes: TaskNodeMetadata[];
  leaves?: TaskLeafMetadata[];
}

export type TaskNodeNextMetadata =
  | TaskNodeNextNodeMetadata
  | TaskNodeNextLeafMetadata;

export interface TaskNodeNextLeafMetadata {
  type: 'leaf';
  id: TaskLeafId;
}

export interface TaskNodeNextNodeMetadata {
  type: 'node';
  id: TaskNodeId;
}

export interface TaskNodeMetadata {
  id: TaskNodeId;
  definition: NodeId;
  stage?: TaskNodeStage;

  nexts?: TaskNodeNextMetadata[];
}

export interface TaskLeafMetadata {
  id: TaskLeafId;
  definition: LeafId;

  lastArrivedAt?: number;
}
