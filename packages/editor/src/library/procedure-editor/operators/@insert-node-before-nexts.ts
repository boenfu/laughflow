import type {NodeId} from '@laughflow/procedure';
import type {OperatorFunction} from '@laughflow/procedure/operators';
import {
  addNodeNexts,
  out,
  replaceNodeNexts,
} from '@laughflow/procedure/operators';

export const insertNodeBeforeNexts: (
  from: NodeId,
) => OperatorFunction<[NodeId]> = from => target =>
  out(replaceNodeNexts(from, [target]), nexts => addNodeNexts(target, nexts));
