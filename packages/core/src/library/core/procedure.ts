import {produce} from 'immer';
import {cloneDeep, compact, isEqual} from 'lodash-es';
import {nanoid} from 'nanoid';
import {Nominal} from 'tslang';

import {LeafId, LeafMetadata, LeafType} from './leaf';
import {NodeId, NodeMetadata} from './node';

export type Id = Nominal<string, 'procedure:id'>;

export interface ProcedureMetadata {}

export type ProcedureEdge = ProcedureNodeEdge | ProcedureLeafEdge;

export type ProcedureChildrenType = 'node' | 'leaf';

export interface ProcedureNodeEdge {
  from: NodeId;
  to: NodeId;
}

export interface ProcedureLeafEdge {
  from: NodeId;
  leaf: LeafId;
}

export interface ProcedureDefinition {
  id: Id;
  metadata: ProcedureMetadata;
  leaves: LeafMetadata[];
  nodes: NodeMetadata[];
  edges: ProcedureEdge[];
}

export class Procedure {
  constructor(
    private definition: ProcedureDefinition,
    private setDefinition: (definition: ProcedureDefinition) => void,
  ) {}

  addLeaf(node: NodeId, type: LeafType): void {
    this.update(definition => {
      let id = createId<LeafId>();

      definition.leaves.push({
        id,
        type,
      });

      definition.edges.push({from: node, leaf: id});
    });
  }

  addNode(edgeOrNode: ProcedureEdge | NodeId): void {
    this.update(definition => {
      let id = createId<NodeId>();

      definition.nodes.push({
        id,
      });

      if (typeof edgeOrNode === 'object') {
        let edge = edgeOrNode as ProcedureEdge;

        let edgeIndex = definition.edges.findIndex(edge =>
          isEqual(edge, edgeOrNode),
        );

        let edgeAfter = cloneDeep(edge);
        edgeAfter.from = id;

        definition.edges.splice(
          edgeIndex,
          1,
          {from: edge.from, to: id},
          edgeAfter,
        );
      } else {
        definition.edges.push({from: edgeOrNode, to: id});
      }
    });
  }

  getNodeLeaves(node: NodeId): LeafMetadata[] {
    let leavesSet = new Set(
      compact(
        this.definition.edges.map(edge =>
          edge.from === node && 'leaf' in edge ? edge.leaf : undefined,
        ),
      ),
    );
    return this.definition.leaves.filter(leaf => leavesSet.has(leaf.id));
  }

  private update(handler: (definition: ProcedureDefinition) => void): void {
    this.setDefinition(produce(this.definition, handler));
  }
}

function createId<TId>(): TId {
  return (nanoid(10) as unknown) as TId;
}
