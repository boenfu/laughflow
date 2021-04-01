import {BranchesNode, Leaf, LeafId, Node, NodeId} from '@magicflow/core';
import getOrCreate from 'get-or-create';
import produce from 'immer';
import {cloneDeep, compact} from 'lodash-es';

import {ProcedureUtil} from '../utils';

import {Operator} from './common';

export function addNode<TNode extends Node | BranchesNode>(
  node: TNode,
): Operator<[TNode]> {
  return definition => {
    node = cloneDeep(node);

    return [
      produce(definition, definition => void definition.nodes.push(node)),
      node,
    ];
  };
}

export function updateNode(node: Node | BranchesNode): Operator {
  return definition => {
    let nextNode = cloneDeep(node);

    return produce(definition, definition => {
      let nodeIndex = definition.nodes.findIndex(
        node => node.id === nextNode.id,
      );

      if (nodeIndex === -1) {
        throw Error(`Not found node definition by id '${node.id}'`);
      }

      definition.nodes.splice(nodeIndex, 1, nextNode);
    });
  };
}

export function removeNode(nodeId: NodeId): Operator<[Node | BranchesNode]> {
  return definition => {
    let removedNode!: Node | BranchesNode;

    return [
      produce(definition, definition => {
        let nodes: (Node | BranchesNode)[] = [];

        for (let node of definition.nodes) {
          if (node.id === nodeId) {
            removedNode = cloneDeep(node);
          } else {
            nodes.push(node);
          }

          node.nexts = node.nexts.filter(next => next !== nodeId);
        }

        definition.nodes = nodes;
      }),
      removedNode,
    ];
  };
}

export function replaceNodeNexts(nodeId: NodeId, nexts: NodeId[]): Operator {
  return definition =>
    produce(definition, definition => {
      ProcedureUtil.requireNode(definition, nodeId).nexts = nexts.map(
        next => ProcedureUtil.requireNode(definition, next).id,
      );
    });
}

export function replaceNodeLeaves(
  nodeId: NodeId,
  leaves: Leaf[],
): Operator<[Leaf[]]> {
  return definition => {
    let oldLeaves!: Leaf[];

    return [
      produce(definition, definition => {
        let node = ProcedureUtil.requireNode(definition, nodeId);

        oldLeaves = cloneDeep(compact(node.leaves));
        node.leaves = leaves;
      }),
      oldLeaves,
    ];
  };
}

export function addNodeNexts(nodeId: NodeId, nexts: NodeId[]): Operator {
  return definition =>
    produce(definition, definition => {
      ProcedureUtil.requireNode(definition, nodeId).nexts.push(
        ...nexts.map(next => ProcedureUtil.requireNode(definition, next).id),
      );
    });
}

export function addNodeLeaves(
  nodeId: NodeId,
  leaves: Leaf[],
): Operator<[Leaf[]]> {
  return definition => {
    leaves = cloneDeep(leaves);

    return [
      produce(definition, definition => {
        getOrCreate(ProcedureUtil.requireNode(definition, nodeId))
          .property('leaves', [])
          .exec()
          .push(...leaves);
      }),
      leaves,
    ];
  };
}

export function removeNodeNext(nodeId: NodeId, next: NodeId): Operator {
  return definition =>
    produce(definition, definition => {
      let node = ProcedureUtil.requireNode(definition, nodeId);

      let nextIndex = node.nexts.findIndex(id => id === next);

      if (nextIndex === -1) {
        throw Error(`Not found node next by id '${next}'`);
      }

      node.nexts.splice(nextIndex, 1);
    });
}

export function removeNodeNexts(nodeId: NodeId): Operator<[NodeId[]]> {
  return definition => {
    let nexts!: NodeId[];

    return [
      produce(definition, definition => {
        let node = ProcedureUtil.requireNode(definition, nodeId);
        nexts = [...node.nexts];
        node.nexts = [];
      }),
      nexts,
    ];
  };
}

export function updateNodeLeaf(nodeId: NodeId, leaf: Leaf): Operator {
  return definition =>
    produce(definition, definition => {
      let node = ProcedureUtil.requireNode(definition, nodeId);

      if (!node.leaves) {
        throw Error(`Not found leaf definition by id '${leaf.id}'`);
      }

      let leafIndex = node.leaves.findIndex(({id}) => id === leaf.id);

      if (leafIndex === -1) {
        throw Error(`Not found leaf definition by id '${leaf.id}'`);
      }

      node.leaves.splice(leafIndex, 1, leaf);
    });
}

export function removeNodeLeaf(
  nodeId: NodeId,
  leafId: LeafId,
): Operator<[Leaf]> {
  return definition => {
    let leaf!: Leaf;

    return [
      produce(definition, definition => {
        let node = ProcedureUtil.requireNode(definition, nodeId);

        if (!node.leaves) {
          throw Error(`Not found leaf definition by id '${leafId}'`);
        }

        let leafIndex = node.leaves.findIndex(({id}) => id === leafId);

        if (leafIndex === -1) {
          throw Error(`Not found leaf definition by id '${leafId}'`);
        }

        leaf = cloneDeep(node.leaves.splice(leafIndex, 1)[0]);
      }),
      leaf,
    ];
  };
}

export function removeNodeLeaves(nodeId: NodeId): Operator<[Leaf[]]> {
  return definition => {
    let leaves!: Leaf[];

    return [
      produce(definition, definition => {
        let node = ProcedureUtil.requireNode(definition, nodeId);
        leaves = cloneDeep(compact(node.leaves));
        node.leaves = undefined;
      }),
      leaves,
    ];
  };
}
