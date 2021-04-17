import {FlowId, Node, NodeId} from '../core';
import {ProcedureUtil} from '../utils';

import {Operator} from './common';

export function addNode<TNode extends Node>(node: TNode): Operator<[TNode]> {
  return definition => {
    node = ProcedureUtil.cloneDeep(node);
    definition.nodes.push(node);

    return [definition, node];
  };
}

export function updateNode(node: Node): Operator {
  return definition => {
    let nextNode = ProcedureUtil.cloneDeep(node);
    let nodeIndex = definition.nodes.findIndex(node => node.id === nextNode.id);

    if (nodeIndex === -1) {
      throw Error(`Not found node definition by id '${node.id}'`);
    }

    definition.nodes.splice(nodeIndex, 1, nextNode);

    return definition;
  };
}

export function removeNode(nodeId: NodeId): Operator<[Node]> {
  return definition => {
    let removedNode!: Node;

    let nodes: Node[] = [];

    for (let node of definition.nodes) {
      if (node.id === nodeId) {
        removedNode = ProcedureUtil.cloneDeep(node);
      } else {
        nodes.push(node);
      }

      node.nexts = node.nexts.filter(next => next !== nodeId);
    }

    definition.nodes = nodes;

    definition.flows = definition.flows.map(flow => {
      flow.starts = flow.starts.filter(start => start !== nodeId);

      return flow;
    });

    return [definition, removedNode];
  };
}

export function replaceNodeNexts(
  nodeId: NodeId,
  nexts: NodeId[],
): Operator<[NodeId[]]> {
  return definition => {
    let node = ProcedureUtil.requireNode(definition, nodeId);
    let oldNexts = [...node.nexts];

    node.nexts = nexts.map(
      next => ProcedureUtil.requireNode(definition, next).id,
    );

    return [definition, oldNexts];
  };
}

export function replaceNodeNext(
  nodeId: NodeId,
  nextId: NodeId,
  replaceId: NodeId,
): Operator {
  return definition => {
    let node = ProcedureUtil.requireNode(definition, nodeId);
    let nextIndex = node.nexts.findIndex(next => next === nextId);

    if (nextIndex === -1) {
      throw Error(`Not found node next by id '${nextId}'`);
    }

    node.nexts.splice(nextIndex, 1, replaceId);
    return definition;
  };
}

export function addNodeNexts(nodeId: NodeId, nexts: NodeId[]): Operator {
  return definition => {
    ProcedureUtil.requireNode(definition, nodeId).nexts.push(
      ...nexts.map(next => ProcedureUtil.requireNode(definition, next).id),
    );

    return definition;
  };
}

export function removeNodeNext(nodeId: NodeId, next: NodeId): Operator {
  return definition => {
    let node = ProcedureUtil.requireNode(definition, nodeId);

    let nextIndex = node.nexts.findIndex(id => id === next);

    if (nextIndex === -1) {
      throw Error(`Not found node next by id '${next}'`);
    }

    node.nexts.splice(nextIndex, 1);

    return definition;
  };
}

export function removeBranchesNodeFlow(nodeId: NodeId, flow: FlowId): Operator {
  return definition => {
    let branchesNode = ProcedureUtil.requireNode(
      definition,
      nodeId,
      'branchesNode',
    );

    let flowIndex = branchesNode.flows.findIndex(id => id === flow);

    if (flowIndex === -1) {
      throw Error(`Not found branchesNode flow by id '${flow}'`);
    }

    branchesNode.flows.splice(flowIndex, 1);

    return definition;
  };
}

export function removeNodeNexts(nodeId: NodeId): Operator<[NodeId[]]> {
  return definition => {
    let node = ProcedureUtil.requireNode(definition, nodeId);
    let nexts = [...node.nexts];
    node.nexts = [];

    return [definition, nexts];
  };
}
