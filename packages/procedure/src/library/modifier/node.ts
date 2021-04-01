import {
  BranchesNode,
  Leaf,
  LeafId,
  Node,
  NodeId,
  Procedure,
} from '@magicflow/core';
import getOrCreate from 'get-or-create';
import produce from 'immer';
import {cloneDeep, compact} from 'lodash-es';

import {ProcedureUtil} from '../util';

export function addNode(
  definition: Procedure,
  node: Node | BranchesNode,
): Procedure {
  return produce(
    definition,
    definition => void definition.nodes.push(cloneDeep(node)),
  );
}

export function updateNode(
  definition: Procedure,
  node: Node | BranchesNode,
): Procedure {
  let nextNode = cloneDeep(node);

  return produce(definition, definition => {
    let nodeIndex = definition.nodes.findIndex(node => node.id === nextNode.id);

    if (nodeIndex === -1) {
      throw Error(`Not found node definition by id '${node.id}'`);
    }

    definition.nodes.splice(nodeIndex, 1, nextNode);
  });
}

export function removeNode(
  definition: Procedure,
  nodeId: NodeId,
): [Procedure, Node | BranchesNode] {
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
}

export function replaceNodeNexts(
  definition: Procedure,
  nodeId: NodeId,
  nexts: NodeId[],
): Procedure {
  return produce(definition, definition => {
    ProcedureUtil.requireNode(definition, nodeId).nexts = nexts.map(
      next => ProcedureUtil.requireNode(definition, next).id,
    );
  });
}

export function replaceNodeLeaves(
  definition: Procedure,
  nodeId: NodeId,
  leaves: Leaf[],
): Procedure {
  return produce(definition, definition => {
    ProcedureUtil.requireNode(definition, nodeId).leaves = leaves;
  });
}

export function addNodeNexts(
  definition: Procedure,
  nodeId: NodeId,
  nexts: NodeId[],
): Procedure {
  return produce(definition, definition => {
    ProcedureUtil.requireNode(definition, nodeId).nexts.push(
      ...nexts.map(next => ProcedureUtil.requireNode(definition, next).id),
    );
  });
}

export function addNodeLeaves(
  definition: Procedure,
  nodeId: NodeId,
  leaves: Leaf[],
): Procedure {
  return produce(definition, definition => {
    getOrCreate(ProcedureUtil.requireNode(definition, nodeId))
      .property('leaves', [])
      .exec()
      .push(...leaves);
  });
}

export function removeNodeNext(
  definition: Procedure,
  nodeId: NodeId,
  next: NodeId,
): Procedure {
  return produce(definition, definition => {
    let node = ProcedureUtil.requireNode(definition, nodeId);

    let nextIndex = node.nexts.findIndex(id => id === next);

    if (nextIndex === -1) {
      throw Error(`Not found node next by id '${next}'`);
    }

    node.nexts.splice(nextIndex, 1);
  });
}

export function removeNodeNexts(
  definition: Procedure,
  nodeId: NodeId,
): [Procedure, NodeId[]] {
  let nexts!: NodeId[];

  return [
    produce(definition, definition => {
      let node = ProcedureUtil.requireNode(definition, nodeId);
      nexts = [...node.nexts];
      node.nexts = [];
    }),
    nexts,
  ];
}

export function updateNodeLeaf(
  definition: Procedure,
  nodeId: NodeId,
  leaf: Leaf,
): Procedure {
  return produce(definition, definition => {
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
  definition: Procedure,
  nodeId: NodeId,
  leafId: LeafId,
): [Procedure, Leaf] {
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
}

export function removeNodeLeaves(
  definition: Procedure,
  nodeId: NodeId,
): [Procedure, Leaf[]] {
  let leaves!: Leaf[];

  return [
    produce(definition, definition => {
      let node = ProcedureUtil.requireNode(definition, nodeId);
      leaves = cloneDeep(compact(node.leaves));
      node.leaves = undefined;
    }),
    leaves,
  ];
}
