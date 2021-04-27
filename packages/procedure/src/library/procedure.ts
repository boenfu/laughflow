import {compact} from 'lodash-es';

import {
  BranchesNode,
  Flow,
  FlowId,
  Node,
  NodeId,
  ProcedureDefinition,
  SingleNode,
} from './core';

export interface IProcedure {
  definition: ProcedureDefinition;
}

export class Procedure implements IProcedure {
  readonly definition: ProcedureDefinition;

  get flowsMap(): Map<FlowId, Flow> {
    return new Map(this.definition.flows.map(flow => [flow.id, flow]));
  }

  get nodesMap(): Map<NodeId, SingleNode | BranchesNode> {
    return new Map(this.definition.nodes.map(node => [node.id, node]));
  }

  get treeView(): ProcedureTreeView {
    return buildProcedureTreeView(this.definition);
  }

  constructor(definition: ProcedureDefinition) {
    this.definition = definition;
  }
}

export interface IProcedureTreeNode<TNode extends Node> {
  id: NodeId;
  type: TNode['type'];
  /**
   * 前驱节点
   */
  prev: ProcedureTreeNode | ProcedureFlow;
  /**
   * 同一个节点定义在多处使用时
   * left 即对应前一次使用的引用
   * 首次引用的 left 为 undefined
   */
  left: Extract<ProcedureTreeNode, {type: TNode['type']}> | undefined;
  right: Extract<ProcedureTreeNode, {type: TNode['type']}> | undefined;
  nexts: ProcedureTreeNode[];
  definition: TNode;
}

export type ProcedureTreeNode =
  | ProcedureSingleTreeNode
  | ProcedureBranchesTreeNode;

export interface ProcedureSingleTreeNode
  extends IProcedureTreeNode<SingleNode> {}

export interface ProcedureBranchesTreeNode
  extends IProcedureTreeNode<BranchesNode> {
  flows: ProcedureFlow[];
}

export interface ProcedureFlow {
  type: 'flow';
  id: FlowId;
  parent: ProcedureBranchesTreeNode | undefined;
  starts: ProcedureTreeNode[];
  definition: Flow;
}

export type ProcedureEdge = `${FlowId | NodeId}-${NodeId}`;

export interface ProcedureTreeView {
  definition: ProcedureDefinition;
  root: ProcedureFlow;
  nodesMapMap: Map<NodeId, Map<NodeId | FlowId, ProcedureTreeNode>>;
  flowsMap: Map<FlowId, ProcedureFlow>;
}

function buildProcedureTreeView(
  definition: ProcedureDefinition,
): ProcedureTreeView {
  let {start, nodes, flows} = definition;

  let nodesMapMap = new Map<NodeId, Map<NodeId | FlowId, ProcedureTreeNode>>();
  let flowsMap = new Map<FlowId, ProcedureFlow>();

  let nodeDefinitionsMap = new Map(nodes.map(node => [node.id, node]));
  let flowDefinitionsMap = new Map(flows.map(flow => [flow.id, flow]));

  let leftNodesMap = new Map<NodeId, ProcedureTreeNode>();

  let startFlow = flowDefinitionsMap.get(start);

  if (!startFlow) {
    throw Error('todo');
  }

  return {
    root: buildProcedureFlow(startFlow, undefined),
    definition,
    nodesMapMap,
    flowsMap,
  };

  function buildProcedureFlow(
    flow: Flow,
    parent: ProcedureBranchesTreeNode | undefined,
  ): ProcedureFlow {
    let procedureFlow: ProcedureFlow = {
      type: 'flow',
      id: flow.id,
      parent,
      starts: [],
      definition: flow,
    };

    procedureFlow.starts = compact(
      flow.starts.map(node => buildProcedureTreeNode(node, procedureFlow)),
    );

    flowsMap.set(flow.id, procedureFlow);

    return procedureFlow;
  }

  function buildProcedureTreeNode(
    nodeId: NodeId,
    prev: ProcedureTreeNode | ProcedureFlow,
  ): ProcedureTreeNode | undefined {
    let node = nodeDefinitionsMap.get(nodeId);

    if (!node) {
      return;
    }

    let left = leftNodesMap.get(nodeId);
    let nexts: ProcedureTreeNode[] = left?.nexts || [];

    let procedureTreeNode!: ProcedureTreeNode;

    if (node.type === 'singleNode') {
      procedureTreeNode = {
        id: node.id,
        type: 'singleNode',
        definition: node,
        prev,
        left: left as ProcedureSingleTreeNode,
        right: undefined,
        nexts,
      };

      leftNodesMap.set(nodeId, procedureTreeNode);
    } else {
      let flows: ProcedureFlow[] = [];

      procedureTreeNode = {
        id: node.id,
        type: 'branchesNode',
        definition: node,
        prev,
        left: left as ProcedureBranchesTreeNode,
        right: undefined,
        flows,
        nexts,
      };

      leftNodesMap.set(nodeId, procedureTreeNode);

      if (procedureTreeNode.left) {
        procedureTreeNode.flows = [];
      } else {
        for (let flowId of node.flows) {
          let flow = flowDefinitionsMap.get(flowId);

          if (!flow) {
            continue;
          }

          flows.push(buildProcedureFlow(flow, procedureTreeNode));
        }
      }
    }

    if (left) {
      // 双向关联

      left.right = procedureTreeNode;
    } else {
      // 首次使用才生成 nexts

      for (let next of node.nexts) {
        let nextNode = buildProcedureTreeNode(next, procedureTreeNode);

        if (!nextNode) {
          continue;
        }

        nexts.push(nextNode);
      }
    }

    nodesMapMap.set(
      procedureTreeNode.id,
      (nodesMapMap.get(procedureTreeNode.id) || new Map()).set(
        procedureTreeNode.prev.id,
        procedureTreeNode,
      ),
    );

    return procedureTreeNode;
  }
}
