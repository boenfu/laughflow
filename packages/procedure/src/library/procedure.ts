import {
  BranchesNode,
  Flow,
  FlowId,
  NodeId,
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
