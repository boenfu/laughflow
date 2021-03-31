import {
  BranchesNode,
  Flow,
  FlowId,
  Node,
  NodeId,
  Procedure,
} from '@magicflow/core';
import {produce} from 'immer';

/**
 * 清理所有未使用的内容
 */
export function purge(definition: Procedure): Procedure {
  return produce(definition, definition => {
    let unusedNodeMap = new Map<NodeId, Node | BranchesNode>(
      definition.nodes.map(node => [node.id, node]),
    );

    let unusedFlowMap = new Map<FlowId, Flow>(
      definition.flows.map(flow => [flow.id, flow]),
    );

    unusedFlowMap.delete(definition.start);
    let pendingCheckNodes = unusedFlowMap.get(definition.start)?.nodes ?? [];

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

        pendingCheckNodes.push(...(flow?.nodes ?? []));
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
