import {BranchesNode, Flow, FlowId, NodeId, SingleNode} from '@magicflow/core';

import {
  TaskBranchesNodeMetadata,
  TaskFlowMetadata,
  TaskMetadata,
  TaskNodeId,
  TaskNodeMetadata,
  TaskSingleNodeMetadata,
} from '../core';
import {Task, TaskBranchesNode, TaskFlow, TaskSingleNode} from '../task';

export function getFlowDefinition(task: Task, flow: FlowId): Flow | undefined {
  return task.procedure.flowsMap.get(flow);
}

export function getNodeDefinition(
  task: Task,
  id: NodeId,
): SingleNode | undefined {
  let node = task.procedure.nodesMap.get(id);
  return node?.type === 'singleNode' ? node : undefined;
}

export function getBranchesDefinition(
  task: Task,
  id: NodeId,
): BranchesNode | undefined {
  let node = task.procedure.nodesMap.get(id);
  return node?.type === 'branchesNode' ? node : undefined;
}

export function flatFlow(flow: TaskFlow): TaskSingleNode[] {
  return flow.startNodes.flatMap(flatNode);
}

export function flatNode(
  node: TaskSingleNode | TaskBranchesNode,
): TaskSingleNode[] {
  return [
    ...(node instanceof TaskSingleNode ? [node] : flatBranchesNode(node)),
    ...node.nextNodes.flatMap(flatNode),
  ];
}

export function flatBranchesNode(
  branchesNode: TaskBranchesNode,
): TaskSingleNode[] {
  return branchesNode.flows.flatMap(flatFlow);
}

export function getTaskSingleNode(
  task: TaskMetadata,
  id: TaskNodeId,
): TaskSingleNodeMetadata {
  let singleNode = getTaskSingleNodeAtFlow(task.start, id);

  if (singleNode) {
    return singleNode;
  }

  throw Error('todo');
}

export function getTaskSingleNodeAtBranchesNode(
  branchesNode: TaskBranchesNodeMetadata,
  id: TaskNodeId,
): TaskSingleNodeMetadata | undefined {
  for (let flow of branchesNode.flows) {
    let singleNode = getTaskSingleNodeAtFlow(flow, id);

    if (singleNode) {
      return singleNode;
    }
  }

  return undefined;
}

export function getTaskSingleNodeAtFlow(
  flow: TaskFlowMetadata,
  id: TaskNodeId,
): TaskSingleNodeMetadata | undefined {
  for (let node of flow.starts) {
    let singleNode = getSingleNode(node, id);

    if (singleNode) {
      return singleNode;
    }
  }

  return undefined;

  function getSingleNode(
    node: TaskNodeMetadata,
    id: TaskNodeId,
  ): TaskSingleNodeMetadata | undefined {
    let singleNode: TaskSingleNodeMetadata | undefined;

    if (node.type === 'branchesNode') {
      singleNode = getTaskSingleNodeAtBranchesNode(node, id);

      if (singleNode) {
        return singleNode;
      }
    } else if (node.id === id) {
      return node;
    }

    if (!node.nexts?.length) {
      return undefined;
    }

    for (let nextNode of node.nexts) {
      singleNode = getSingleNode(nextNode, id);

      if (singleNode) {
        return singleNode;
      }
    }

    return undefined;
  }
}
