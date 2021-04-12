import {Flow, FlowId, NodeId} from '@magicflow/core';
import {produce} from 'immer';

import {ProcedureUtil} from '../utils';

import {Operator} from './common';

export function addFlow(branchesNodeId: NodeId, flow: Flow): Operator<[Flow]> {
  return definition => {
    flow = ProcedureUtil.cloneDeep(flow);

    return [
      produce(definition, definition => {
        let branchesNode = ProcedureUtil.requireNode(
          definition,
          branchesNodeId,
          'branchesNode',
        );

        definition.flows.push(flow);
        branchesNode.flows.push(flow.id);
      }),
      flow,
    ];
  };
}

export function updateFlow(flow: Flow): Operator {
  return definition =>
    produce(definition, definition => {
      let flowIndex = definition.flows.findIndex(({id}) => id === flow.id);

      if (flowIndex === -1) {
        throw Error(`Not found flow definition by id '${flow.id}'`);
      }

      definition.flows.splice(flowIndex, 1, ProcedureUtil.cloneDeep(flow));
    });
}

export function removeFlow(
  branchesNodeId: NodeId,
  flowId: FlowId,
): Operator<[Flow]> {
  return definition => {
    let flow!: Flow;

    return [
      produce(definition, definition => {
        if (flowId === definition.start) {
          // can not remove start flow
          return;
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
        flow = ProcedureUtil.cloneDeep(
          definition.flows.splice(flowDefinitionIndex, 1),
        )[0];
      }),
      flow,
    ];
  };
}

export function addFlowStart(flowId: FlowId, nodeId: NodeId): Operator {
  return definition =>
    produce(definition, definition => {
      ProcedureUtil.requireNode(definition, nodeId);
      ProcedureUtil.requireFlow(definition, flowId).starts.push(nodeId);
    });
}

export function replaceFlowStart(
  flowId: FlowId,
  startId: NodeId,
  replaceId: NodeId,
): Operator {
  return definition =>
    produce(definition, definition => {
      let flow = ProcedureUtil.requireFlow(definition, flowId);
      let startIndex = flow.starts.findIndex(next => next === startId);

      if (startIndex === -1) {
        throw Error(`Not found flow start by id '${startId}'`);
      }

      flow.starts.splice(startIndex, 1, replaceId);
    });
}

export function removeFlowStart(flowId: FlowId, nodeId: NodeId): Operator {
  return definition =>
    produce(definition, definition => {
      let flow = ProcedureUtil.requireFlow(definition, flowId);

      let nodeIndex = flow.starts.findIndex(id => id === nodeId);

      if (nodeIndex === -1) {
        throw Error(`Not found flow start by id '${nodeId}'`);
      }

      flow.starts.splice(nodeIndex, 1);
    });
}

export function removeAllFlowStart(flowId: FlowId, nodeId: NodeId): Operator {
  return definition =>
    produce(definition, definition => {
      let flow = ProcedureUtil.requireFlow(definition, flowId);
      flow.starts = flow.starts.filter(id => id !== nodeId);
    });
}
