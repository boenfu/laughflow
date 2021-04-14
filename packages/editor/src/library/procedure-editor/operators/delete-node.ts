import {ProcedureTreeNode} from '@magicflow/procedure';
import {
  OperatorFunction,
  compose,
  removeFlowStart,
  removeNode,
  removeNodeNext,
} from '@magicflow/procedure/operators';

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
