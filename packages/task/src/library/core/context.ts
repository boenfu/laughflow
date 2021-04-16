import {Node, NodeType, Procedure} from '@magicflow/core';
import {Dict} from 'tslang';

import {TaskSingleNode} from '../task';

import {TaskMetadata, TaskNodeMetadata} from './task';

export interface TaskContextFunctionParams {
  definition: Procedure;
  metadata: TaskMetadata;
}

export interface TaskNodeContextFunctionParams<
  TNodeType extends NodeType = NodeType
> {
  definition: Extract<Node, {type: TNodeType}>;
  metadata: Extract<TaskNodeMetadata, {type: TNodeType}>;
  inputs: Dict<any>;
}

export interface TaskContext {
  // reload outputs
  // such as tags
  preloadTaskExtraOutputs?(params: TaskContextFunctionParams): Dict<any>;

  preloadTaskNodeExtraOutputs?(
    params: TaskNodeContextFunctionParams<'singleNode'>,
  ): Dict<any>;

  getTaskAbleToBeStart?(params: TaskContextFunctionParams): boolean;

  getTaskNodeBroken?(params: TaskNodeContextFunctionParams): boolean;

  getTaskNodeIgnored?(params: TaskNodeContextFunctionParams): boolean;

  getTaskNodeAbleToBeStart?(
    params: TaskNodeContextFunctionParams<'singleNode'>,
  ): boolean;

  getTaskNodeAbleToBeDone?(
    params: TaskNodeContextFunctionParams<'singleNode'>,
  ): boolean;

  getTaskNodeAbleToBeTerminated?(
    params: TaskNodeContextFunctionParams<'singleNode'>,
  ): boolean;

  next?(task: TaskMetadata): TaskMetadata;

  nextNode?(node: TaskSingleNode): TaskSingleNode;
}
