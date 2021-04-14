import {Dict} from 'tslang';

import {TaskMetadata, TaskNodeMetadata, TaskSingleNodeMetadata} from './task';

export interface TaskContext {
  // reload outputs
  // such as tags
  preloadTaskExtraOutputs?(taskMetadata: TaskMetadata): Dict<any>;

  getTaskAbleToBeStart?(taskMetadata: TaskMetadata): boolean;

  getTaskNodeBroken?(
    nodeMetadata: TaskNodeMetadata,
    inputs: Dict<any>,
  ): boolean;

  getTaskNodeIgnored?(
    nodeMetadata: TaskNodeMetadata,
    inputs: Dict<any>,
  ): boolean;

  getTaskNodeAbleToBeStart?(
    nodeMetadata: TaskSingleNodeMetadata,
    inputs: Dict<any>,
  ): boolean;

  getTaskNodeAbleToBeDone?(
    nodeMetadata: TaskSingleNodeMetadata,
    inputs: Dict<any>,
  ): boolean;

  getTaskNodeAbleToBeTerminated?(
    nodeMetadata: TaskSingleNodeMetadata,
    inputs: Dict<any>,
  ): boolean;
}
