import {BranchesNode, Flow, FlowId, Node, NodeId} from '@magicflow/core';
import {produce} from 'immer';

import {Operator} from './common';

/**
 * 清理所有未使用的内容
 */
export function purge(): Operator {
  return definition =>
    produce(definition, definition => {
      let unusedNodeMap = new Map<NodeId, Node | BranchesNode>(
        definition.nodes.map(node => [node.id, node]),
      );

      let unusedFlowMap = new Map<FlowId, Flow>(
        definition.flows.map(flow => [flow.id, flow]),
      );

      let pendingCheckNodes = [...unusedFlowMap.get(definition.start)!.nodes];

      unusedFlowMap.delete(definition.start);

      while (pendingCheckNodes.length) {
        let nodeId = pendingCheckNodes.shift()!;

        if (!unusedNodeMap.has(nodeId)) {
          continue;
        }

        let node = unusedNodeMap.get(nodeId)!;

        unusedNodeMap.delete(nodeId);

        pendingCheckNodes.push(...node.nexts);

        if (node.type !== 'branchesNode') {
          continue;
        }

        for (let flowId of node.flows) {
          let flow = unusedFlowMap.get(flowId);

          unusedFlowMap.delete(flowId);

          pendingCheckNodes.push(...flow!.nodes);
        }
      }

      definition.nodes = definition.nodes.filter(
        node => !unusedNodeMap.has(node.id),
      );
      definition.flows = definition.flows.filter(
        flow => !unusedFlowMap.has(flow.id),
      );
    });
}
