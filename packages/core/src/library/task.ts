import {Nominal} from 'tslang';

import {LeafId} from './leaf';
import {NextMetadata, NodeId} from './node';
import {ProcedureId} from './procedure';

export type TaskId = Nominal<string, 'task:id'>;
export type TaskNodeId = Nominal<string, 'task-node:id'>;
export type TaskLeafId = Nominal<string, 'task-leaf:id'>;

export interface TaskMetadata {
  id: TaskId;
  definition: ProcedureId;

  startNode: TaskNodeId;

  nodes: TaskNodeMetadata[];
  leaves?: TaskLeafMetadata[];
}

export interface TaskNodeMetadata {
  id: TaskNodeId;
  definition: NodeId;

  nexts?:NextMetadata[];
}

export interface TaskLeafMetadata {
  id: TaskLeafId;
  definition: LeafId;
}
