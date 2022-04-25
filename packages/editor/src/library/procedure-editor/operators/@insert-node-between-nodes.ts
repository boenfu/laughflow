import type {NodeId} from '@laughflow/procedure';
import type {OperatorFunction} from '@laughflow/procedure/operators';
import {
  addNodeNexts,
  compose,
  replaceNodeNext,
} from '@laughflow/procedure/operators';

export const insertNodeBetweenNodes: ({}: {
  from: NodeId;
  to: NodeId;
}) => OperatorFunction<[NodeId]> =
  ({from, to}) =>
  target =>
    compose([replaceNodeNext(from, to, target), addNodeNexts(target, [to])]);
