import {BranchesNode, NodeId, SingleNode} from '@magicflow/core';
import produce from 'immer';
import {cloneDeep} from 'lodash-es';

import {ProcedureUtil} from '../utils';

import {Operator} from './common';

export function addNode<TNode extends SingleNode | BranchesNode>(
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

export function updateNode(node: SingleNode | BranchesNode): Operator {
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

export function removeNode(
  nodeId: NodeId,
): Operator<[SingleNode | BranchesNode]> {
  return definition => {
    let removedNode!: SingleNode | BranchesNode;

    return [
      produce(definition, definition => {
        let nodes: (SingleNode | BranchesNode)[] = [];

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

export function addNodeNexts(nodeId: NodeId, nexts: NodeId[]): Operator {
  return definition =>
    produce(definition, definition => {
      ProcedureUtil.requireNode(definition, nodeId).nexts.push(
        ...nexts.map(next => ProcedureUtil.requireNode(definition, next).id),
      );
    });
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
