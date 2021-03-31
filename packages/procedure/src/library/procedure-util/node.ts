import {BranchesNode, Node, NodeId, NodeType, Procedure} from '@magicflow/core';

import {createId} from './common';

export function requireNode<TNodeType extends NodeType>(
  definition: Procedure,
  nodeId: NodeId,
  type?: TNodeType,
): TNodeType extends NodeType
  ? Extract<Node | BranchesNode, {type: TNodeType}>
  : Node | BranchesNode {
  let node = definition.nodes.find(node => node.id === nodeId);

  if (!node) {
    throw Error(`Not found node definition by id '${nodeId}'`);
  }

  if (type && node.type !== type) {
    throw Error(`Not found ${type} definition by id '${nodeId}'`);
  }

  return node as any;
}

export function createNode({
  id: _id,
  nexts = [],
  ...partial
}: Partial<Node> = {}): Node {
  return {
    id: createId(),
    type: 'node',
    nexts,
    ...partial,
  };
}

export function createBranchesNode({
  id: _id,
  nexts = [],
  flows = [],
  ...partial
}: Partial<BranchesNode> = {}): BranchesNode {
  return {
    id: createId(),
    type: 'branchesNode',
    flows,
    nexts,
    ...partial,
  };
}

export function copyNode<TNode extends Node | BranchesNode>(
  node: TNode,
): TNode {
  return {
    ...node,
    id: createId(),
  };
}
