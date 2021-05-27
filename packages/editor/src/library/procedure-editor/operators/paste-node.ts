import {FlowId, NodeId, ProcedureSingleTreeNode} from '@magicflow/procedure';
import {
  Operator,
  OperatorFunction,
  addNode,
  addNodeNexts,
  compose,
  out,
} from '@magicflow/procedure/operators';
import {copyNode} from '@magicflow/procedure/utils';

import {insertNodeAsFlowStart} from './@insert-node-as-flow-start';
import {insertNodeBeforeNexts} from './@insert-node-before-nexts';
import {insertNodeBetweenNodes} from './@insert-node-between-nodes';
import {stripNode} from './@strip-node';

type PasteType = 'move' | 'copy';

export interface PasteNodeOperatorParam {
  type: PasteType;
  node: ProcedureSingleTreeNode;
  from: NodeId;
  to?: NodeId;
}

const getPasteNode: OperatorFunction<
  [
    PasteNodeOperatorParam['type'],
    PasteNodeOperatorParam['node'],
    (value: NodeId) => Operator,
  ]
> = (type, node, callback) => {
  let nodeId = node.id;

  if (type === 'move') {
    return compose([
      stripNode({prev: node.prev, node: nodeId}),
      callback(nodeId),
    ]);
  }

  return out(
    definition => addNode(copyNode(node.definition))(definition),
    node => callback(node.id),
  );
};

/**
 * 在节点之后粘贴节点
 * @param param0
 * @returns
 */
export const pasteNode: OperatorFunction<[PasteNodeOperatorParam]> = ({
  type,
  node,
  from,
}) => getPasteNode(type, node, node => addNodeNexts(from, [node]));

/**
 * 在两个节点间粘贴节点
 * @param param0
 * @returns
 */
export const pasteNodeBetweenNodes: OperatorFunction<
  [Required<PasteNodeOperatorParam>]
> = ({from, to, type, node}) =>
  getPasteNode(type, node, insertNodeBetweenNodes({from, to}));

/**
 * 在节点之后粘贴节点并迁移 nexts
 * @param param0
 * @returns
 */
export const pasteNodeBeforeNexts: OperatorFunction<
  [PasteNodeOperatorParam]
> = ({from, type, node}) =>
  getPasteNode(type, node, insertNodeBeforeNexts(from));

/**
 * 粘贴节点并作为 flow start
 * @param param0
 * @returns
 */
export const pasteNodeAsFlowStart: OperatorFunction<
  [
    {
      flow: FlowId;
      type: PasteNodeOperatorParam['type'];
      node: PasteNodeOperatorParam['node'];
      originStart?: NodeId;
    },
  ]
> = ({flow, type, node, originStart}) =>
  getPasteNode(type, node, insertNodeAsFlowStart({flow, originStart}));
