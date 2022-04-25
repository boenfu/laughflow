import type {IOutputsEntity, NodeId, NodeType} from '@laughflow/procedure';
import type {Nominal} from 'tslang';

import type {TaskStage} from '../task';

import type {TaskBranchesNode, TaskBranchesNodeMetadata} from './branches';
import type {TaskSingleNode, TaskSingleNodeMetadata} from './single';

export type TaskNodeId = Nominal<string, 'task-node:id'>;

export type TaskNodeMetadata =
  | TaskSingleNodeMetadata
  | TaskBranchesNodeMetadata;

export type TaskNode = TaskSingleNode | TaskBranchesNode;

export interface ITaskNodeMetadata extends IOutputsEntity {
  id: TaskNodeId;
  definition: NodeId;
  type: NodeType;
  stage: TaskStage;
  nexts?: TaskNodeMetadata[];
}
