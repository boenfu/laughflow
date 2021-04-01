import {Flow, FlowId, NodeId} from '@magicflow/core';
import getOrCreate from 'get-or-create';
import {produce} from 'immer';
import {cloneDeep} from 'lodash-es';

import {ProcedureUtil} from '../utils';

import {Operator} from './common';

export function addFlow(branchesNodeId: NodeId, flow: Flow): Operator<[Flow]> {
  return definition => {
    flow = cloneDeep(flow);

    return [
      produce(definition, definition => {
        let branchesNode = ProcedureUtil.requireNode(
          definition,
          branchesNodeId,
          'branchesNode',
        );

        getOrCreate(definition).property('flows', []).exec().push(flow);
        getOrCreate(branchesNode).property('flows', []).exec().push(flow.id);
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

      definition.flows.splice(flowIndex, 1, cloneDeep(flow));
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

        if (flowIndex === -1) {
          throw Error(`Not found flow definition by id '${flowId}'`);
        }

        branchesNode.flows.splice(flowIndex, 1);
        flow = cloneDeep(definition.flows.splice(flowDefinitionIndex, 1))[0];
      }),
      flow,
    ];
  };
}

export function addFlowStart(flowId: FlowId, nodeId: NodeId): Operator {
  return definition =>
    produce(definition, definition => {
      ProcedureUtil.requireNode(definition, nodeId);
      ProcedureUtil.requireFlow(definition, flowId).nodes.push(nodeId);
    });
}

export function removeFlowStart(flowId: FlowId, nodeId: NodeId): Operator {
  return definition =>
    produce(definition, definition => {
      let flow = ProcedureUtil.requireFlow(definition, flowId);

      let nodeIndex = flow.nodes.findIndex(id => id === nodeId);

      if (nodeIndex === -1) {
        return;
      }

      flow.nodes.splice(nodeIndex, 1);
    });
}

export function removeAllFlowStart(flowId: FlowId, nodeId: NodeId): Operator {
  return definition =>
    produce(definition, definition => {
      let flow = ProcedureUtil.requireFlow(definition, flowId);
      flow.nodes = flow.nodes.filter(id => id !== nodeId);
    });
}
