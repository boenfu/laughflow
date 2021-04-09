import {NodeId} from '@magicflow/core';
import {
  OperatorFunction,
  addNodeNexts,
  out,
  replaceNodeNexts,
} from '@magicflow/procedure/operators';

export const insertNodeBeforeNexts: OperatorFunction<
  [
    {
      from: NodeId;
      to: NodeId;
    },
  ]
> = ({from, to}) =>
  out(replaceNodeNexts(from, [to]), nexts => addNodeNexts(to, nexts));
