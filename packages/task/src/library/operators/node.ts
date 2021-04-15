import {TaskNodeId} from '../core';
import {getTaskSingleNode} from '../utils';

import {OperatorFunction} from './common';

export const startNode: OperatorFunction<[TaskNodeId]> = (
  id: TaskNodeId,
) => task => {
  getTaskSingleNode(task, id).stage = 'in-progress';
  return task;
};
