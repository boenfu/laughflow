import {
  BranchesNode,
  Flow,
  FlowId,
  Node,
  NodeId,
  Procedure as ProcedureDefinition,
  SingleNode,
} from '@magicflow/core';
import {cloneDeep, compact} from 'lodash-es';

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

  get treeView(): ProcedureFlow {
    return buildProcedureFlow(this.definition);
  }

  constructor(definition: ProcedureDefinition) {
    this.definition = cloneDeep(definition);
  }
}

export interface IProcedureTreeNode<TNode extends Node> {
  id: NodeId;
  type: TNode['type'];
  /**
   * 前驱节点
   */
  prev: ProcedureTreeNode | undefined;
  /**
   * 同一个节点定义在多处使用时
   * left 即对应前一次使用的引用
   * 首次引用的 left 为 undefined
   */
  left: Extract<ProcedureTreeNode, {type: TNode['type']}> | undefined;
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
  id: FlowId;
  parent: ProcedureBranchesTreeNode | undefined;
  starts: ProcedureTreeNode[];
  definition: Flow;
}

function buildProcedureFlow(definition: ProcedureDefinition): ProcedureFlow {
  let {start, nodes, flows} = definition;

  let nodesMap = new Map(nodes.map(node => [node.id, node]));
  let flowsMap = new Map(flows.map(flow => [flow.id, flow]));

  let leftNodesMap = new Map<NodeId, ProcedureTreeNode>();

  let startFlow = flowsMap.get(start);

  if (!startFlow) {
    throw Error('todo');
  }

  return buildProcedureFlow(startFlow, undefined);

  function buildProcedureFlow(
    flow: Flow,
    parent: ProcedureBranchesTreeNode | undefined,
  ): ProcedureFlow {
    return {
      id: flow.id,
      parent,
      starts: compact(
        flow.starts.map(node => buildProcedureTreeNode(node, undefined)),
      ),
      definition: flow,
    };
  }

  function buildProcedureTreeNode(
    nodeId: NodeId,
    prev: ProcedureTreeNode | undefined,
  ): ProcedureTreeNode | undefined {
    let node = nodesMap.get(nodeId);

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
        nexts,
      };
    } else {
      let flows: ProcedureFlow[] = [];

      procedureTreeNode = {
        id: node.id,
        type: 'branchesNode',
        definition: node,
        prev,
        left: left as ProcedureBranchesTreeNode,
        flows,
        nexts,
      };

      for (let flowId of node.flows) {
        let flow = flowsMap.get(flowId);

        if (!flow) {
          continue;
        }

        flows.push(buildProcedureFlow(flow, procedureTreeNode));
      }
    }

    leftNodesMap.set(nodeId, procedureTreeNode);

    if (!left) {
      for (let next of node.nexts) {
        let nextNode = buildProcedureTreeNode(next, procedureTreeNode);

        if (!nextNode) {
          continue;
        }

        nexts.push(nextNode);
      }
    }

    return procedureTreeNode;
  }
}
