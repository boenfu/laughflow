import {
  ITaskRuntime as ITaskContext,
  Task,
  TaskNodeRuntimeMethodParams,
  TaskRuntimeMethodParams,
} from '@magicflow/task';
import {createContext} from 'react';
import {Dict} from 'tslang';

import {IPlugin} from '../plugin';

export class TaskContext implements ITaskContext {
  constructor(private plugins: IPlugin[]) {}

  preloadOutputs = (params: TaskRuntimeMethodParams): Dict<any> => {
    return Object.assign(
      {},
      ...this.plugins.map(
        ({
          task: {
            context: {preloadOutputs: preloadTaskExtraOutputs},
          },
        }) => (preloadTaskExtraOutputs ? preloadTaskExtraOutputs(params) : {}),
      ),
    );
  };

  nodeOutputs = (
    params: TaskNodeRuntimeMethodParams<'singleNode'>,
  ): Dict<any> => {
    return Object.assign(
      {},
      ...this.plugins.map(
        ({
          task: {
            context: {nodeOutputs: preloadTaskNodeExtraOutputs},
          },
        }) =>
          preloadTaskNodeExtraOutputs
            ? preloadTaskNodeExtraOutputs(params)
            : {},
      ),
    );
  };

  startAble = (params: TaskRuntimeMethodParams): boolean => {
    return this.plugins.every(
      ({
        task: {
          context: {startAble: getTaskAbleToBeStart},
        },
      }) => (getTaskAbleToBeStart ? getTaskAbleToBeStart(params) : true),
    );
  };

  nodeBroken = (params: TaskNodeRuntimeMethodParams): boolean => {
    return this.plugins.some(({task: {context}}) =>
      context.nodeBroken?.(params),
    );
  };

  nodeIgnored = (params: TaskNodeRuntimeMethodParams): boolean => {
    return this.plugins.some(({task: {context}}) =>
      context.nodeIgnored?.(params),
    );
  };

  nodeStartAble = (
    params: TaskNodeRuntimeMethodParams<'singleNode'>,
  ): boolean => {
    return this.plugins.every(
      ({
        task: {
          context: {nodeStartAble: getTaskNodeAbleToBeStart},
        },
      }) =>
        getTaskNodeAbleToBeStart ? getTaskNodeAbleToBeStart(params) : true,
    );
  };

  nodeDone = (params: TaskNodeRuntimeMethodParams<'singleNode'>): boolean => {
    return this.plugins.every(
      ({
        task: {
          context: {nodeDone: getTaskNodeAbleToBeDone},
        },
      }) => (getTaskNodeAbleToBeDone ? getTaskNodeAbleToBeDone(params) : true),
    );
  };

  nodeTerminated = (
    params: TaskNodeRuntimeMethodParams<'singleNode'>,
  ): boolean => {
    return this.plugins.some(({task: {context}}) =>
      context.nodeTerminated?.(params),
    );
  };
}

export const ViewerContext = createContext<{
  task: Task;
}>(undefined!);
