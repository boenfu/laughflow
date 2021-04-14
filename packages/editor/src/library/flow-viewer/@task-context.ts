import {
  Task,
  TaskContext as ITaskContext,
  TaskMetadata,
  TaskNodeMetadata,
  TaskSingleNodeMetadata,
} from '@magicflow/task';
import {createContext} from 'react';
import {Dict} from 'tslang';

import {IPlugin} from '../plugin';

export class TaskContext implements ITaskContext {
  constructor(private plugins: IPlugin[]) {}

  preloadTaskExtraOutputs = (taskMetadata: TaskMetadata): Dict<any> => {
    return Object.assign(
      this.plugins.map(({task: {context: {preloadTaskExtraOutputs}}}) =>
        preloadTaskExtraOutputs ? preloadTaskExtraOutputs(taskMetadata) : {},
      ),
    );
  };

  getTaskAbleToBeStart = (taskMetadata: TaskMetadata): boolean => {
    return this.plugins.every(({task: {context: {getTaskAbleToBeStart}}}) =>
      getTaskAbleToBeStart ? getTaskAbleToBeStart(taskMetadata) : true,
    );
  };

  getTaskNodeBroken = (
    nodeMetadata: TaskNodeMetadata,
    inputs: Dict<any>,
  ): boolean => {
    return this.plugins.some(({task: {context}}) =>
      context.getTaskNodeBroken?.(nodeMetadata, inputs),
    );
  };

  getTaskNodeIgnored = (
    nodeMetadata: TaskNodeMetadata,
    inputs: Dict<any>,
  ): boolean => {
    return this.plugins.some(({task: {context}}) =>
      context.getTaskNodeIgnored?.(nodeMetadata, inputs),
    );
  };

  getTaskNodeAbleToBeStart = (
    nodeMetadata: TaskSingleNodeMetadata,
    inputs: Dict<any>,
  ): boolean => {
    return this.plugins.every(({task: {context: {getTaskNodeAbleToBeStart}}}) =>
      getTaskNodeAbleToBeStart
        ? getTaskNodeAbleToBeStart(nodeMetadata, inputs)
        : true,
    );
  };

  getTaskNodeAbleToBeDone = (
    nodeMetadata: TaskSingleNodeMetadata,
    inputs: Dict<any>,
  ): boolean => {
    return this.plugins.every(({task: {context: {getTaskNodeAbleToBeDone}}}) =>
      getTaskNodeAbleToBeDone
        ? getTaskNodeAbleToBeDone(nodeMetadata, inputs)
        : true,
    );
  };

  getTaskNodeAbleToBeTerminated = (
    nodeMetadata: TaskSingleNodeMetadata,
    inputs: Dict<any>,
  ): boolean => {
    return this.plugins.some(({task: {context}}) =>
      context.getTaskNodeAbleToBeTerminated?.(nodeMetadata, inputs),
    );
  };
}

export const ViewerContext = createContext<{
  task: Task;
}>(undefined!);
