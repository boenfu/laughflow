import {IOutputsEntity, NodeId, NodeType} from '@magicflow/procedure';
import {Nominal} from 'tslang';

import {TaskStage} from '../task';

import {TaskBranchesNode, TaskBranchesNodeMetadata} from './branches';
import {TaskSingleNode, TaskSingleNodeMetadata} from './single';

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
