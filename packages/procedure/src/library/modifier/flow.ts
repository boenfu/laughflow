import {Flow, FlowId, NodeId, Procedure} from '@magicflow/core';
import getOrCreate from 'get-or-create';
import {produce} from 'immer';
import {cloneDeep} from 'lodash-es';

import {ProcedureUtil} from '../util';

export function addFlow(
  definition: Procedure,
  branchesNodeId: NodeId,
  flow: Flow,
): Procedure {
  return produce(definition, definition => {
    let branchesNode = ProcedureUtil.requireNode(
      definition,
      branchesNodeId,
      'branchesNode',
    );

    getOrCreate(definition).property('flows', []).exec().push(flow);
    getOrCreate(branchesNode).property('flows', []).exec().push(flow.id);
  });
}

export function updateFlow(definition: Procedure, flow: Flow): Procedure {
  return produce(definition, definition => {
    let flowIndex = definition.flows.findIndex(({id}) => id === flow.id);

    if (flowIndex === -1) {
      throw Error(`Not found flow definition by id '${flow.id}'`);
    }

    definition.flows.splice(flowIndex, 1, cloneDeep(flow));
  });
}

export function removeFlow(
  definition: Procedure,
  branchesNodeId: NodeId,
  flowId: FlowId,
): [Procedure, Flow] {
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
      [flow] = definition.flows.splice(flowDefinitionIndex, 1);
    }),
    flow,
  ];
}

export function addFlowStart(
  definition: Procedure,
  flowId: FlowId,
  nodeId: NodeId,
): Procedure {
  return produce(definition, definition => {
    ProcedureUtil.requireNode(definition, nodeId);
    ProcedureUtil.requireFlow(definition, flowId).nodes.push(nodeId);
  });
}

export function removeFlowStart(
  definition: Procedure,
  flowId: FlowId,
  nodeId: NodeId,
): Procedure {
  return produce(definition, definition => {
    let flow = ProcedureUtil.requireFlow(definition, flowId);

    let nodeIndex = flow.nodes.findIndex(id => id === nodeId);

    if (nodeIndex === -1) {
      return;
    }

    flow.nodes.splice(nodeIndex, 1);
  });
}

export function removeAllFlowStart(
  definition: Procedure,
  flowId: FlowId,
  nodeId: NodeId,
): Procedure {
  return produce(definition, definition => {
    let flow = ProcedureUtil.requireFlow(definition, flowId);
    flow.nodes = flow.nodes.filter(id => id !== nodeId);
  });
}
