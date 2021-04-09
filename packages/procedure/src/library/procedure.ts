import {
  BranchesNode,
  Flow,
  FlowId,
  Node,
  NodeId,
  NodeType,
  Procedure as ProcedureDefinition,
  SingleNode,
} from '@magicflow/core';
import {cloneDeep} from 'lodash-es';

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
  prev: IProcedureTreeNode<Node> | undefined;
  /**
   * 同一个节点定义在多处使用时
   * left 即对应前一次使用的引用
   * 首次引用的 left 为 undefined
   */
  left: IProcedureTreeNode<TNode> | undefined;
  nexts: IProcedureTreeNode<Node>[] | undefined;
  metadata: TNode;
}

export type ProcedureTreeNode =
  | ProcedureSingleNodeTreeNode
  | ProcedureBranchesNodeTreeNode;

export type ProcedureSingleNodeTreeNode = IProcedureTreeNode<SingleNode>;

export type ProcedureBranchesNodeTreeNode = IProcedureTreeNode<BranchesNode>;
