import type {ProcedureTreeNode} from '@laughflow/procedure';
import type {OperatorFunction} from '@laughflow/procedure/operators';
import {
  compose,
  removeFlowStart,
  removeNode,
  removeNodeNext,
} from '@laughflow/procedure/operators';

import {stripNode} from './@strip-node';

export const deleteNode: OperatorFunction<[ProcedureTreeNode], any> = node =>
  compose([
    stripNode({prev: node.prev, node: node.id}),
    ...(!node.left && !node.right ? [removeNode(node.id)] : []),
  ]);

export const deleteLinkNode: OperatorFunction<
  [ProcedureTreeNode],
  any
> = node =>
  node.prev.type === 'flow'
    ? removeFlowStart(node.prev.id, node.id)
    : removeNodeNext(node.prev.id, node.id);
