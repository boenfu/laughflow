import {
  Task,
  TaskContext as ITaskContext,
  TaskContextFunctionParams,
  TaskNodeContextFunctionParams,
} from '@magicflow/task';
import {createContext} from 'react';
import {Dict} from 'tslang';

import {IPlugin} from '../plugin';

export class TaskContext implements ITaskContext {
  constructor(private plugins: IPlugin[]) {}

  preloadTaskExtraOutputs = (params: TaskContextFunctionParams): Dict<any> => {
    return Object.assign(
      {},
      ...this.plugins.map(({task: {context: {preloadTaskExtraOutputs}}}) =>
        preloadTaskExtraOutputs ? preloadTaskExtraOutputs(params) : {},
      ),
    );
  };

  preloadTaskNodeExtraOutputs = (
    params: TaskNodeContextFunctionParams<'singleNode'>,
  ): Dict<any> => {
    return Object.assign(
      {},
      ...this.plugins.map(({task: {context: {preloadTaskNodeExtraOutputs}}}) =>
        preloadTaskNodeExtraOutputs ? preloadTaskNodeExtraOutputs(params) : {},
      ),
    );
  };

  getTaskAbleToBeStart = (params: TaskContextFunctionParams): boolean => {
    return this.plugins.every(({task: {context: {getTaskAbleToBeStart}}}) =>
      getTaskAbleToBeStart ? getTaskAbleToBeStart(params) : true,
    );
  };

  getTaskNodeBroken = (params: TaskNodeContextFunctionParams): boolean => {
    return this.plugins.some(({task: {context}}) =>
      context.getTaskNodeBroken?.(params),
    );
  };

  getTaskNodeIgnored = (params: TaskNodeContextFunctionParams): boolean => {
    return this.plugins.some(({task: {context}}) =>
      context.getTaskNodeIgnored?.(params),
    );
  };

  getTaskNodeAbleToBeStart = (
    params: TaskNodeContextFunctionParams<'singleNode'>,
  ): boolean => {
    return this.plugins.every(({task: {context: {getTaskNodeAbleToBeStart}}}) =>
      getTaskNodeAbleToBeStart ? getTaskNodeAbleToBeStart(params) : true,
    );
  };

  getTaskNodeAbleToBeDone = (
    params: TaskNodeContextFunctionParams<'singleNode'>,
  ): boolean => {
    return this.plugins.every(({task: {context: {getTaskNodeAbleToBeDone}}}) =>
      getTaskNodeAbleToBeDone ? getTaskNodeAbleToBeDone(params) : true,
    );
  };

  getTaskNodeAbleToBeTerminated = (
    params: TaskNodeContextFunctionParams<'singleNode'>,
  ): boolean => {
    return this.plugins.some(({task: {context}}) =>
      context.getTaskNodeAbleToBeTerminated?.(params),
    );
  };
}

export const ViewerContext = createContext<{
  task: Task;
}>(undefined!);
