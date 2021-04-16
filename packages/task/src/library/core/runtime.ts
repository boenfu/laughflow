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

  preloadOutputs?(params: TaskRuntimeMethodParams): Dict<any>;

  startAble?(params: TaskRuntimeMethodParams): boolean;

  // node

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

export class TaskRuntime implements Required<ITaskRuntime> {
  constructor(private runTimeArray: ITaskRuntime[]) {}

  preloadOutputs = (params: TaskRuntimeMethodParams): Dict<any> => {
    return Object.assign(
      {},
      ...this.runTimeArray.map(({preloadOutputs}) =>
        preloadOutputs ? preloadOutputs(params) : {},
      ),
    );
  };

  nodeOutputs = (
    params: TaskNodeRuntimeMethodParams<'singleNode'>,
  ): Dict<any> => {
    return Object.assign(
      {},
      ...this.runTimeArray.map(({nodeOutputs}) =>
        nodeOutputs ? nodeOutputs(params) : {},
      ),
    );
  };

  startAble = (params: TaskRuntimeMethodParams): boolean => {
    return this.runTimeArray.every(({startAble}) =>
      startAble ? startAble(params) : true,
    );
  };

  nodeBroken = (params: TaskNodeRuntimeMethodParams): boolean => {
    return this.runTimeArray.some(({nodeBroken}) => nodeBroken?.(params));
  };

  nodeIgnored = (params: TaskNodeRuntimeMethodParams): boolean => {
    return this.runTimeArray.some(({nodeIgnored}) => nodeIgnored?.(params));
  };

  nodeNextContinueAble = (
    params: TaskNodeRuntimeMethodParams,
    next: NodeId,
  ): boolean => {
    return this.runTimeArray.every(({nodeNextContinueAble}) =>
      nodeNextContinueAble ? nodeNextContinueAble(params, next) : true,
    );
  };

  nodeStartAble = (
    params: TaskNodeRuntimeMethodParams<'singleNode'>,
  ): boolean => {
    return this.runTimeArray.every(({nodeStartAble}) =>
      nodeStartAble ? nodeStartAble(params) : true,
    );
  };

  nodeDone = (params: TaskNodeRuntimeMethodParams<'singleNode'>): boolean => {
    return this.runTimeArray.every(({nodeDone}) =>
      nodeDone ? nodeDone(params) : true,
    );
  };

  nodeTerminated = (
    params: TaskNodeRuntimeMethodParams<'singleNode'>,
  ): boolean => {
    return this.runTimeArray.some(({nodeTerminated}) =>
      nodeTerminated?.(params),
    );
  };

  next(metadata: TaskMetadata): TaskMetadata {
    for (let {next} of this.runTimeArray) {
      if (!next) {
        continue;
      }

      metadata = next(metadata);
    }

    return metadata;
  }

  nextNode(metadata: TaskSingleNodeMetadata): TaskSingleNodeMetadata {
    for (let {nextNode} of this.runTimeArray) {
      if (!nextNode) {
        continue;
      }

      metadata = nextNode(metadata);
    }

    return metadata;
  }
}
