import Eventemitter from 'eventemitter3';
import {Patch, applyPatches, produce} from 'immer';
import {castArray, cloneDeep, compact, isEqual, sortBy} from 'lodash-es';
import {nanoid} from 'nanoid';
import {ComponentType} from 'react';
import {Nominal} from 'tslang';

import {doneLeaf, terminateLeaf} from '../editor';
import {
  ILeafAction,
  ILeafPlugin,
  ILeafPluginEventHandlers,
  ILeafSelector,
  IPlugin,
  IPluginEventHandlers,
  PluginEventHandler,
  PluginLeafElementProps,
  PluginLeafEventType,
} from '../plugin';

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

export interface LeafRenderDescriptors {
  type: LeafType;
  render: ComponentType<PluginLeafElementProps>;
  selector: ILeafSelector;
  actions: ILeafAction[];
}

export interface IProcedure {
  definition: ProcedureDefinition;

  setPlugins(plugins: IPlugin[]): void;
  setDefinition(definition: ProcedureDefinition): void;

  getLeafRenderDescriptors(): LeafRenderDescriptors[];
  getLeafRenderDescriptor(type: LeafType): LeafRenderDescriptors | undefined;

  addLeaf(node: NodeId, type: LeafType, partial?: Partial<LeafMetadata>): void;
  deleteLeaf(leafId: LeafId): void;

  addNode(edgeOrNode: ProcedureEdge | NodeId, migrateChildren?: boolean): void;
  updateNode(node: NodeMetadata): void;

  getNodeLeaves(node: NodeId): LeafMetadata[];

  undo(): void;
  redo(): void;
}

type ProcedureEventType = 'update';

interface ProcedureActionStack {
  undoes: Patch[][];
  redoes: Patch[][];
  cursor: number;
}

export class Procedure
  extends Eventemitter<ProcedureEventType>
  implements IProcedure {
  private _definition: ProcedureDefinition;
  private plugins: IPlugin[] = [];

  private leafRenderDescriptors: Map<string, LeafRenderDescriptors> = new Map();

  private actionStack: ProcedureActionStack = {
    undoes: [],
    redoes: [],
    cursor: -1,
  };

  get definition(): ProcedureDefinition {
    return this._definition;
  }

  constructor(definition: ProcedureDefinition, plugins?: IPlugin[]) {
    super();

    this._definition = cloneDeep(definition);

    if (plugins) {
      this.setPlugins(plugins);
    }
  }

  undo(): void {
    let actionStack = this.actionStack;

    if (actionStack.cursor === actionStack.redoes.length - 1) {
      return;
    }

    actionStack.cursor += 1;

    this.setDefinition(
      applyPatches(this._definition, actionStack.undoes[actionStack.cursor]),
    );
  }

  redo(): void {
    let actionStack = this.actionStack;

    if (actionStack.cursor === -1) {
      return;
    }

    this.setDefinition(
      applyPatches(this._definition, actionStack.redoes[actionStack.cursor]),
    );

    actionStack.cursor -= 1;
  }

  setPlugins(plugins: IPlugin[]): void {
    this.plugins = plugins;

    let leavesMap = new Map<string, ILeafPlugin>([
      ['done', doneLeaf],
      ['terminate', terminateLeaf],
    ]);

    for (let plugin of castArray(plugins)) {
      if (plugin?.leaves?.length) {
        for (let {type, render, selector, actions = []} of plugin.leaves) {
          let {
            render: lastRender,
            selector: lastSelector,
            actions: lastActions = [],
          } = leavesMap.get(type) || {};

          leavesMap.set(type, {
            type,
            render: render || lastRender,
            selector: selector || lastSelector,
            actions: [...lastActions, ...actions],
          });
        }
      }
    }

    for (let [type, plugin] of leavesMap) {
      if (!plugin.selector || !plugin.render) {
        leavesMap.delete(type);

        continue;
      }

      leavesMap.set(type, {
        ...plugin,
        actions: sortBy(plugin.actions, ({order}) => order),
      });
    }

    this.leafRenderDescriptors = new Map(
      sortBy([...leavesMap.entries()], ([, {selector}]) => selector?.order),
    ) as Map<string, LeafRenderDescriptors>;
  }

  setDefinition(definition: ProcedureDefinition): void {
    this._definition = definition;
    this.emit('update');
  }

  getLeafRenderDescriptors(): LeafRenderDescriptors[] {
    return [...this.leafRenderDescriptors.values()];
  }

  getLeafRenderDescriptor(type: LeafType): LeafRenderDescriptors | undefined {
    return this.leafRenderDescriptors.get(type);
  }

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

      if (
        !(await leafHandler('create', definition, this.plugins, node, metadata))
      ) {
        return;
      }

      definition.leaves.push(metadata);
      definition.edges.push({from: node, leaf: id});
    }).catch(console.error);
  }

  deleteLeaf(leafId: LeafId): void {
    this.update(async definition => {
      let leafIndex = definition.leaves.findIndex(leaf => leaf.id === leafId);
      let leafEdgeIndex = definition.edges.findIndex(edge =>
        'leaf' in edge ? edge.leaf === leafId : false,
      );

      if (leafIndex === -1) {
        if (leafEdgeIndex !== -1) {
          definition.edges.splice(leafEdgeIndex, 1);
        }

        return;
      }

      let leaf = definition.leaves[leafIndex];
      let edge = definition.edges[leafEdgeIndex];

      if (
        !(await leafHandler(
          'delete',
          definition,
          this.plugins,
          edge.from,
          leaf,
        ))
      ) {
        return;
      }

      definition.leaves.splice(leafIndex, 1);
      definition.edges.splice(leafEdgeIndex, 1);
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

  updateNode(node: NodeMetadata): void {
    this.update(definition => {
      let nodeIndex = definition.nodes.findIndex(({id}) => id === node.id);

      if (nodeIndex === -1) {
        return;
      }

      definition.nodes.splice(nodeIndex, 1, node);
    }).catch(console.error);
  }

  getNodeLeaves(node: NodeId): LeafMetadata[] {
    let leavesSet = new Set(
      compact(
        this._definition.edges.map(edge =>
          edge.from === node && 'leaf' in edge ? edge.leaf : undefined,
        ),
      ),
    );
    return this._definition.leaves.filter(leaf => leavesSet.has(leaf.id));
  }

  private async update(
    handler: (definition: ProcedureDefinition) => Promise<void> | void,
  ): Promise<void> {
    let definition = await produce(
      this._definition,
      handler,
      (patches, inversePatches) => {
        let actionStack = this.actionStack;
        let size = actionStack.cursor + 1;
        actionStack.undoes.splice(0, size, inversePatches);
        actionStack.redoes.splice(0, size, patches);
        actionStack.cursor = -1;
      },
    );

    if (definition === this._definition) {
      return;
    }

    this.setDefinition(definition);
  }
}

function createId<TId>(): TId {
  return (nanoid(8) as unknown) as TId;
}

const LEAF_EVENT_TYPE_TO_KEY_DICT: {
  [key in PluginLeafEventType]: [
    keyof IPluginEventHandlers,
    keyof ILeafPluginEventHandlers,
  ];
} = {
  create: ['onLeafCreate', 'onCreate'],
  delete: ['onLeafDelete', 'onDelete'],
};

async function leafHandler(
  type: PluginLeafEventType,
  definition: ProcedureDefinition,
  plugins: IPlugin[],
  parent: NodeId,
  metadata: LeafMetadata,
): Promise<boolean> {
  let [globalEventKey, leafEventKey] = LEAF_EVENT_TYPE_TO_KEY_DICT[type];

  let handlers = plugins
    .reduce<[PluginEventHandler[], PluginEventHandler[]]>(
      ([leafHandler, pluginHandler], plugin) => {
        leafHandler.push(
          ...compact(
            plugin.leaves?.map(
              leaf => leaf.type === metadata.type && leaf[leafEventKey],
            ),
          ),
        );

        if (plugin[globalEventKey]) {
          pluginHandler.push(plugin[globalEventKey]!);
        }

        return [leafHandler, pluginHandler];
      },
      [[], []],
    )
    .flat();

  let toPropagation = true;
  let toExecuteDefault = true;

  let stopPropagation = (): void => {
    toPropagation = false;
  };
  let preventDefault = (): void => {
    toExecuteDefault = false;
  };

  for (let handler of handlers) {
    if (!toPropagation) {
      break;
    }

    await handler({
      type,
      definition,
      metadata,
      node: parent,
      stopPropagation,
      preventDefault,
    });
  }

  return toExecuteDefault;
}
