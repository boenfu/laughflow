import {
  BranchesNode,
  Flow,
  FlowId,
  NodeId,
  Procedure as ProcedureDefinition,
  SingleNode,
} from '@magicflow/core';
import {createId} from '@magicflow/procedure/utils';

import {
  Task,
  TaskBranchesNode,
  TaskBranchesNodeMetadata,
  TaskFlow,
  TaskFlowMetadata,
  TaskMetadata,
  TaskNodeId,
  TaskNodeMetadata,
  TaskSingleNode,
  TaskSingleNodeMetadata,
} from '../core';

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

  let edgeSet = new Set();

  return {
    id: createId(),
    definition: id,
    stage: 'none',
    start: initFlow(flowsMap.get(start)!),
  };

  function initFlow({id, starts: nodeIds}: Flow): TaskFlowMetadata {
    let nodes: TaskNodeMetadata[] = [];

    for (let nodeId of nodeIds) {
      let edge = `${id}-${nodeId}`;

      if (edgeSet.has(edge)) {
        continue;
      }

      let node = nodesMap.get(nodeId)!;
      nodes.push(
        node.type === 'singleNode' ? initNode(node) : initBranchesNode(node),
      );
      edgeSet.add(edge);
    }

    return {
      id: createId(),
      definition: id,
      stage: 'none',
      starts: nodes,
    };
  }

  function initNode({
    id,
    type,
    nexts: nextIds,
  }: SingleNode): TaskSingleNodeMetadata {
    let nexts: TaskNodeMetadata[] = [];

    for (let nextId of nextIds) {
      let edge = `${id}-${nextId}`;

      if (edgeSet.has(edge)) {
        continue;
      }

      let node = nodesMap.get(nextId)!;
      nexts.push(
        node.type === 'singleNode' ? initNode(node) : initBranchesNode(node),
      );
      edgeSet.add(edge);
    }

    return {
      id: createId(),
      definition: id,
      type,
      stage: 'none',
      nexts,
    };
  }

  function initBranchesNode(node: BranchesNode): TaskBranchesNodeMetadata {
    let flows: TaskFlowMetadata[] = [];

    for (let flowId of node.flows) {
      let edge = `${id}-${flowId}`;

      if (edgeSet.has(edge)) {
        continue;
      }

      let flow = flowsMap.get(flowId)!;
      flows.push(initFlow(flow));
      edgeSet.add(edge);
    }

    return {
      ...initNode({
        ...node,
        type: 'singleNode',
      }),
      type: 'branchesNode',
      flows,
    };
  }
}

/**
 * 升级任务流程
 * @param param0
 * @param task
 * @returns
 */
// export function upgradeTask(
//   {id, start, flows, nodes}: ProcedureDefinition,
//   _task: TaskMetadata,
// ): TaskMetadata {
//   let task = cloneDeep(_task);

//   let nodesMap = new Map(nodes.map(node => [node.id, node]));
//   let flowsMap = new Map(flows.map(flow => [flow.id, flow]));

//   let edgeSet = new Set();

//   checkFlow(flowsMap.get(start)!, task.start);

//   return task;

//   function checkFlow(
//     {id, starts: nodeIds}: Flow,
//     flow: TaskFlowMetadata,
//   ): void {
//     let definitionIdToNodesMap = new Map(
//       flow.nodes.map(node => [node.definition, node]),
//     );

//     for (let nodeId of nodeIds) {
//       let edge = `${id}-${nodeId}`;

//       if (definitionIdToNodesMap.has(nodeId)) {
//         edgeSet.add(edge);
//         continue;
//       }

//       if (edgeSet.has(edge)) {
//         continue;
//       }

//       let node = nodesMap.get(nodeId)!;

//       if (node.type === 'singleNode') {
//         checkNode(
//           node,
//           definitionIdToNodesMap.get(nodeId) as TaskSingleNodeMetadata,
//         );
//       } else {
//         checkBranchesNode(
//           node,
//           definitionIdToNodesMap.get(nodeId) as TaskBranchesNodeMetadata,
//         );
//       }

//       edgeSet.add(edge);
//     }
//   }

//   function checkNode(
//     {id, type, nexts: nextIds}: SingleNode,
//     node: TaskSingleNodeMetadata,
//   ): void {
//     let definitionIdToNodesMap = new Map(
//       node.nexts?.map(node => [node.definition, node]),
//     );

//     for (let nextId of nextIds) {
//       let edge = `${id}-${nextId}`;

//       if (definitionIdToNodesMap.has(nextId)) {
//         edgeSet.add(edge);
//         continue;
//       }

//       if (edgeSet.has(edge)) {
//         continue;
//       }

//       let node = nodesMap.get(nextId)!;

//       if (node.type === 'singleNode') {
//         checkNode(
//           node,
//           definitionIdToNodesMap.get(nextId) as TaskSingleNodeMetadata,
//         );
//       } else {
//         checkBranchesNode(
//           node,
//           definitionIdToNodesMap.get(nextId) as TaskBranchesNodeMetadata,
//         );
//       }

//       edgeSet.add(edge);
//     }
//   }

//   function checkBranchesNode(
//     node: BranchesNode,
//     branchedNode: TaskBranchesNodeMetadata,
//   ): void {
//     for (let flowId of node.flows) {
//       let edge = `${id}-${flowId}`;

//       if (edgeSet.has(edge)) {
//         continue;
//       }

//       let flow = flowsMap.get(flowId)!;
//       // checkFlow(flow);
//       edgeSet.add(edge);
//     }

//     // checkNode({
//     //   ...node,
//     //   type: 'node',
//     // });
//   }
// }
