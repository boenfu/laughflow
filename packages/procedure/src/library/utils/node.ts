import {
  BranchesNode,
  Node,
  NodeId,
  NodeType,
  Procedure,
  SingleNode,
} from '@magicflow/core';

import {createId} from './common';

export function requireNode<TNodeType extends NodeType>(
  definition: Procedure,
  nodeId: NodeId,
  type?: TNodeType,
): TNodeType extends NodeType
  ? Extract<SingleNode | BranchesNode, {type: TNodeType}>
  : SingleNode | BranchesNode {
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
  id = createId()!,
  nexts = [],
  ...partial
}: Partial<SingleNode> = {}): SingleNode {
  return {
    id,
    type: 'singleNode',
    nexts,
    ...partial,
  };
}

export function createBranchesNode({
  id = createId()!,
  nexts = [],
  flows = [],
  ...partial
}: Partial<BranchesNode> = {}): BranchesNode {
  return {
    id,
    type: 'branchesNode',
    flows,
    nexts,
    ...partial,
  };
}

export function copyNode<TNode extends Node>(node: TNode): TNode {
  return {
    ...node,
    id: createId(),
  };
}
