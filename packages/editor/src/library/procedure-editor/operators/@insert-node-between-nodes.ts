import {NodeId} from '@magicflow/procedure';
import {
  OperatorFunction,
  addNodeNexts,
  compose,
  replaceNodeNext,
} from '@magicflow/procedure/operators';

export const insertNodeBetweenNodes: ({}: {
  from: NodeId;
  to: NodeId;
}) => OperatorFunction<[NodeId]> = ({from, to}) => target =>
  compose([replaceNodeNext(from, to, target), addNodeNexts(target, [to])]);
