import {produce} from 'immer';
import {cloneDeep, compact, isEqual} from 'lodash-es';
import {nanoid} from 'nanoid';
import {Nominal} from 'tslang';

import {IPlugin, PluginEventHandler} from '../plugin';

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
    private plugins: IPlugin<string>[] = [],
  ) {}

  addLeaf(
    node: NodeId,
    type: LeafType,
    partial: Partial<LeafMetadata> = {},
  ): void {
    this.update(async definition => {
      let id = createId<LeafId>();
      let metadata = {
        ...partial,
        id,
        type,
      };

      let handlers = this.plugins
        .reduce<[PluginEventHandler[], PluginEventHandler[]]>(
          ([leafHandler, pluginHandler], plugin) => {
            leafHandler.push(
              ...compact(
                plugin.leaves?.map(leaf => leaf.type === type && leaf.onCreate),
              ),
            );

            if (plugin.onLeafCreate) {
              pluginHandler.push(plugin.onLeafCreate);
            }

            return [leafHandler, pluginHandler];
          },
          [[], []],
        )
        .flat();

      let toPropagation = true;
      let toPush = true;

      let stopPropagation = (): void => {
        toPropagation = false;
      };
      let preventDefault = (): void => {
        toPush = false;
      };

      for (let handler of handlers) {
        if (!toPropagation) {
          break;
        }

        await handler({
          metadata,
          definition,
          target: node,
          stopPropagation,
          preventDefault,
        });
      }

      if (!toPush) {
        return;
      }

      definition.leaves.push(metadata);
      definition.edges.push({from: node, leaf: id});
    }).catch(console.error);
  }

  addNode(edge: ProcedureEdge): void;
  addNode(node: NodeId, migrateChildren?: boolean): void;
  addNode(edgeOrNode: ProcedureEdge | NodeId, migrateChildren = false): void {
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
        if (migrateChildren) {
          definition.edges = definition.edges.map(edge => {
            if (edge.from !== edgeOrNode) {
              return edge;
            }

            return {
              ...edge,
              from: id,
            };
          });
        }

        definition.edges.push({from: edgeOrNode, to: id});
      }
    }).catch(console.error);
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

  private async update(
    handler: (definition: ProcedureDefinition) => Promise<void> | void,
  ): Promise<void> {
    let definition = await produce(
      this.definition,
      handler,
      (patches, inversePatches) => {
        console.log(patches, inversePatches);
      },
    );

    if (definition === this.definition) {
      return;
    }

    this.setDefinition(definition);
  }
}

function createId<TId>(): TId {
  return (nanoid(10) as unknown) as TId;
}
