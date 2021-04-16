import {Flow, Node, NodeId, NodeType, Procedure} from '@magicflow/core';
import {Dict} from 'tslang';

import {TaskFlowMetadata} from './flow';
import {TaskNodeMetadata, TaskSingleNodeMetadata} from './node';
import {TaskMetadata} from './task';

export interface TaskRuntimeMethodParams {
  definition: Procedure;
  metadata: TaskMetadata;
}

export interface TaskNodeRuntimeMethodParams<
  TNodeType extends NodeType = NodeType
> {
  definition: Extract<Node, {type: TNodeType}>;
  metadata: Extract<TaskNodeMetadata, {type: TNodeType}>;
  inputs: Dict<any>;
}

export interface TaskFlowRuntimeMethodParams {
  definition: Flow;
  metadata: TaskFlowMetadata;
  inputs: Dict<any>;
}

export interface ITaskRuntime {
  // task

  initialize?(params: TaskRuntimeMethodParams): TaskMetadata;

  preloadOutputs?(params: TaskRuntimeMethodParams): Dict<any>;

  startAble?(params: TaskRuntimeMethodParams): boolean;

  // node

  nodeInitialize?<TNodeType extends NodeType = NodeType>(
    params: TaskNodeRuntimeMethodParams<TNodeType>,
  ): Extract<TaskNodeMetadata, {type: TNodeType}>;

  nodeBroken?(params: TaskNodeRuntimeMethodParams): boolean;

  nodeIgnored?(params: TaskNodeRuntimeMethodParams): boolean;

  nodeNextContinueAble?(
    params: TaskNodeRuntimeMethodParams | TaskFlowRuntimeMethodParams,
    next: NodeId,
  ): boolean;

  // singleNode

  nodeStartAble?(params: TaskNodeRuntimeMethodParams<'singleNode'>): boolean;

  nodeDone?(params: TaskNodeRuntimeMethodParams<'singleNode'>): boolean;

  nodeTerminated?(params: TaskNodeRuntimeMethodParams<'singleNode'>): boolean;

  nodeOutputs?(params: TaskNodeRuntimeMethodParams<'singleNode'>): Dict<any>;

  // next

  next?(task: TaskMetadata): TaskMetadata;

  nextNode?(node: TaskSingleNodeMetadata): TaskSingleNodeMetadata;
}
