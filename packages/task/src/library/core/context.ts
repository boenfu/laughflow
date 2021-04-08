import {Dict} from 'tslang';

import {TaskMetadata, TaskNodeMetadata, TaskSingleNodeMetadata} from './task';

export interface ITaskContext {
  // reload outputs
  // such as tags
  preloadTaskExtraOutputs?(taskMetadata: TaskMetadata): Dict<any>;

  // every true
  getTaskAbleToBeStart?(taskMetadata: TaskMetadata): boolean;

  // some true
  getTaskNodeBroken?(
    nodeMetadata: TaskNodeMetadata,
    inputs: Dict<any>,
  ): boolean;
  // some true
  getTaskNodeIgnored?(
    nodeMetadata: TaskNodeMetadata,
    inputs: Dict<any>,
  ): boolean;

  // every true
  getTaskNodeAbleToBeStart?(
    nodeMetadata: TaskSingleNodeMetadata,
    inputs: Dict<any>,
  ): boolean;
  // every true
  getTaskNodeAbleToBeDone?(
    nodeMetadata: TaskSingleNodeMetadata,
    inputs: Dict<any>,
  ): boolean;
  // some true
  getTaskNodeAbleToBeTerminated?(
    nodeMetadata: TaskSingleNodeMetadata,
    inputs: Dict<any>,
  ): boolean;
}
