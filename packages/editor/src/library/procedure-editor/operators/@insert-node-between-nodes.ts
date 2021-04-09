import {NodeId} from '@magicflow/core';
import {
  OperatorFunction,
  addNodeNexts,
  compose,
  replaceNodeNext,
} from '@magicflow/procedure/operators';

export const insertNodeBetweenNodes: OperatorFunction<
  [
    {
      from: NodeId;
      to: NodeId;
      target: NodeId;
    },
  ]
> = ({from, to, target}) =>
  compose([replaceNodeNext(from, to, target), addNodeNexts(target, [to])]);
