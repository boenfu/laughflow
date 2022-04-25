import type {
  BranchesNode,
  Flow,
  FlowId,
  Node,
  NodeId,
  ProcedureDefinition,
  SingleNode,
} from '@laughflow/procedure';
import {createId} from '@laughflow/procedure/utils';

import type {
  Task,
  TaskBranchesNode,
  TaskBranchesNodeMetadata,
  TaskFlow,
  TaskFlowMetadata,
  TaskMetadata,
  TaskNodeId,
  TaskNodeMetadata,
  TaskSingleNodeMetadata,
} from '../core';
import {TaskSingleNode} from '../core';

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
  return flow.starts.flatMap(flatNode);
}

export function flatNode(
  node: TaskSingleNode | TaskBranchesNode,
): TaskSingleNode[] {
  return [
    ...(node instanceof TaskSingleNode ? [node] : flatBranchesNode(node)),
    ...node.nexts.flatMap(flatNode),
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

  throw Error('TODO');
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

interface InitContext {
  usedNodeSet: Set<NodeId>;
  nextable?: boolean;
  getNodeDefinition(node: NodeId): Node | undefined;
  getFlowDefinition(flow: FlowId): Flow | undefined;
}

/**
 * 初始化任务
 * @param param0
 * @returns
 */
export function initTask({
  id,
  start,
  flows,
  nodes,
}: ProcedureDefinition): TaskMetadata {
  let nodesMap = new Map(nodes.map(node => [node.id, node]));
  let flowsMap = new Map(flows.map(flow => [flow.id, flow]));

  let usedNodeSet = new Set<NodeId>();

  let context: InitContext = {
    usedNodeSet,
    getNodeDefinition: node => nodesMap.get(node)!,
    getFlowDefinition: flow => flowsMap.get(flow)!,
  };

  return {
    id: createId(),
    definition: id,
    stage: 'none',
    start: initFlow(start, context),
  };
}

export function initFlow(
  flowId: FlowId,
  {usedNodeSet, getNodeDefinition, getFlowDefinition}: InitContext,
): TaskFlowMetadata {
  let flow = getFlowDefinition(flowId);

  if (!flow) {
    throw Error(`Not found flow "${flowId}"`);
  }

  let {id, starts: nodeIds} = flow;

  let nodes: TaskNodeMetadata[] = [];

  for (let nodeId of nodeIds) {
    let nextable = !usedNodeSet.has(nodeId);

    nodes.push(
      initNode(nodeId, {
        nextable,
        getNodeDefinition,
        getFlowDefinition,
        usedNodeSet,
      }),
    );
  }

  return {
    id: createId(),
    definition: id,
    stage: 'none',
    starts: nodes,
  };
}

export function initNode(
  nodeId: NodeId,
  {
    nextable = true,
    usedNodeSet,
    getNodeDefinition,
    getFlowDefinition,
  }: InitContext,
): TaskSingleNodeMetadata | TaskBranchesNodeMetadata {
  let node = getNodeDefinition(nodeId);

  if (!node) {
    throw Error(`Not found node "${nodeId}"`);
  }

  usedNodeSet.add(nodeId);

  let nexts: TaskNodeMetadata[] = [];
  let flows: TaskFlowMetadata[] = [];

  if (nextable) {
    if (node.type === 'branchesNode') {
      if (nextable) {
        for (let flowId of node.flows) {
          flows.push(
            initFlow(flowId, {
              usedNodeSet,
              getNodeDefinition,
              getFlowDefinition,
            }),
          );
        }
      }
    }

    for (let nextId of node.nexts) {
      let nextNextable = !usedNodeSet.has(nextId);

      usedNodeSet.add(nextId);

      nexts.push(
        initNode(nextId, {
          usedNodeSet,
          nextable: nextNextable,
          getNodeDefinition,
          getFlowDefinition,
        }),
      );
    }
  }

  return {
    id: createId(),
    definition: nodeId,
    ...(node.type === 'singleNode'
      ? {
          type: 'singleNode',
        }
      : {
          type: 'branchesNode',
          flows,
        }),
    stage: 'none',
    nexts,
  };
}
