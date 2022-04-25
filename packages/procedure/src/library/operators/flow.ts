import type {Flow, FlowId, NodeId} from '../core';
import {ProcedureUtil} from '../utils';

import type {Operator} from './common';

export function addFlow(branchesNodeId: NodeId, flow: Flow): Operator<[Flow]> {
  return definition => {
    flow = ProcedureUtil.cloneDeep(flow);

    let branchesNode = ProcedureUtil.requireNode(
      definition,
      branchesNodeId,
      'branchesNode',
    );

    definition.flows.push(flow);
    branchesNode.flows.push(flow.id);

    return [definition, flow];
  };
}

export function updateFlow(flow: Flow): Operator {
  return definition => {
    let flowIndex = definition.flows.findIndex(({id}) => id === flow.id);

    if (flowIndex === -1) {
      throw Error(`Not found flow definition by id '${flow.id}'`);
    }

    definition.flows.splice(flowIndex, 1, ProcedureUtil.cloneDeep(flow));

    return definition;
  };
}

export function removeFlow(
  branchesNodeId: NodeId,
  flowId: FlowId,
): Operator<[Flow]> {
  return definition => {
    if (flowId === definition.start) {
      throw Error('Can not remove start flow');
    }

    let branchesNode = ProcedureUtil.requireNode(
      definition,
      branchesNodeId,
      'branchesNode',
    );

    let flowIndex = branchesNode.flows.findIndex(flow => flow === flowId);

    if (flowIndex === -1) {
      throw Error(
        `Not found flow '${flowId}' in branchesNode '${branchesNodeId}'`,
      );
    }

    let flowDefinitionIndex = definition.flows.findIndex(
      ({id}) => id === flowId,
    );

    if (flowDefinitionIndex === -1) {
      throw Error(`Not found flow definition by id '${flowId}'`);
    }

    branchesNode.flows.splice(flowIndex, 1);

    return [
      definition,
      ProcedureUtil.cloneDeep(
        definition.flows.splice(flowDefinitionIndex, 1),
      )[0],
    ];
  };
}

export function addFlowStart(flowId: FlowId, nodeId: NodeId): Operator {
  return definition => {
    ProcedureUtil.requireNode(definition, nodeId);
    ProcedureUtil.requireFlow(definition, flowId).starts.push(nodeId);

    return definition;
  };
}

export function replaceFlowStart(
  flowId: FlowId,
  startId: NodeId,
  replaceId: NodeId,
): Operator {
  return definition => {
    let flow = ProcedureUtil.requireFlow(definition, flowId);
    let startIndex = flow.starts.findIndex(next => next === startId);

    if (startIndex === -1) {
      throw Error(`Not found flow start by id '${startId}'`);
    }

    flow.starts.splice(startIndex, 1, replaceId);
    return definition;
  };
}

export function removeFlowStart(flowId: FlowId, nodeId: NodeId): Operator {
  return definition => {
    let flow = ProcedureUtil.requireFlow(definition, flowId);

    let nodeIndex = flow.starts.findIndex(id => id === nodeId);

    if (nodeIndex === -1) {
      throw Error(`Not found flow start by id '${nodeId}'`);
    }

    flow.starts.splice(nodeIndex, 1);
    return definition;
  };
}

export function removeAllFlowStart(
  flowId: FlowId,
  nodeId?: NodeId,
): Operator<[NodeId[]]> {
  return definition => {
    let flow = ProcedureUtil.requireFlow(definition, flowId);

    if (nodeId) {
      flow.starts = flow.starts.filter(id => id !== nodeId);
      return [definition, [nodeId]];
    }

    let oldStarts = [...flow.starts];

    flow.starts = [];

    return [definition, oldStarts];
  };
}
