import {ProcedureTreeNode} from '@magicflow/procedure';
import {
  OperatorFunction,
  removeFlowStart,
  removeNode,
  removeNodeNext,
} from '@magicflow/procedure/operators';

export const deleteNode: OperatorFunction<[ProcedureTreeNode], any> = node =>
  node.left || node.right
    ? node.prev.type === 'flow'
      ? removeFlowStart(node.prev.id, node.id)
      : removeNodeNext(node.prev.id, node.id)
    : removeNode(node.id);
