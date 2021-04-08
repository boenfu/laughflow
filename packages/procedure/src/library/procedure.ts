import {
  BranchesNode,
  Flow,
  FlowId,
  Node,
  NodeId,
  Procedure as ProcedureDefinition,
} from '@magicflow/core';
import {cloneDeep} from 'lodash-es';
import memorize from 'memorize-decorator';

export interface IProcedure {
  definition: ProcedureDefinition;
}

export class Procedure implements IProcedure {
  private _definition!: ProcedureDefinition;

  get definition(): ProcedureDefinition {
    return this._definition;
  }

  @memorize({
    ttl: false,
  })
  get flowsMap(): Map<FlowId, Flow> {
    return new Map(this.definition.flows.map(flow => [flow.id, flow]));
  }

  @memorize({
    ttl: false,
  })
  get nodesMap(): Map<NodeId, Node | BranchesNode> {
    return new Map(this.definition.nodes.map(node => [node.id, node]));
  }

  constructor(definition: ProcedureDefinition) {
    this.setDefinition(cloneDeep(definition));
  }

  private setDefinition(definition: ProcedureDefinition): void {
    this._definition = definition;
  }
}
