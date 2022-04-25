import {NodeId} from '@laughflow/procedure';
import {
  OperatorFunction,
  addNodeNexts,
  compose,
  replaceNodeNext,
} from '@laughflow/procedure/operators';

export const insertNodeBetweenNodes: ({}: {
  from: NodeId;
  to: NodeId;
}) => OperatorFunction<[NodeId]> = ({from, to}) => target =>
  compose([replaceNodeNext(from, to, target), addNodeNexts(target, [to])]);
