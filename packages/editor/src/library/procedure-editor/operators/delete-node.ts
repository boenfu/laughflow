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
  node.left || node.right
    ? node.prev.type === 'flow'
      ? removeFlowStart(node.prev.id, node.id)
      : removeNodeNext(node.prev.id, node.id)
    : compose([
        stripNode({prev: node.prev, node: node.id}),
        removeNode(node.id),
      ]);
