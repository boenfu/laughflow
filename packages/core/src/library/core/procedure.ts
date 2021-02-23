import Eventemitter from 'eventemitter3';
import {Patch, applyPatches, produce} from 'immer';
import {castArray, cloneDeep, compact, isEqual, merge, sortBy} from 'lodash-es';
import {nanoid} from 'nanoid';
import {Nominal} from 'tslang';

import {doneLeaf, terminateLeaf} from '../editor';
import {
  ILeafPlugin,
  ILeafPluginEventHandlers,
  IPlugin,
  IPluginEventHandlers,
  LeafAction,
  LeafPluginComponent,
  LeafSelector,
  NodePluginComponentRender,
  PluginEventHandler,
  PluginLeafEventType,
} from '../plugin';

import {LeafId, LeafMetadata, LeafType} from './leaf';
import {NextMetadata, NodeId, NodeMetadata} from './node';

export type Id = Nominal<string, 'procedure:id'>;

export interface ProcedureMetadata {}

export interface ProcedureDefinition {
  id: Id;
  metadata: ProcedureMetadata;
  leaves: LeafMetadata[];
  nodes: NodeMetadata[];
}

export interface LeafRenderDescriptor {
  type: LeafType;
  render: LeafPluginComponent;
  selector: LeafSelector;
  actions: LeafAction[];
}

export type NodeRenderDescriptor = NodePluginComponentRender;

export interface IProcedure {
  definition: ProcedureDefinition;

  setPlugins(plugins: IPlugin[]): void;
  setDefinition(definition: ProcedureDefinition): void;

  getLeafRenderDescriptors(): LeafRenderDescriptor[];
  getLeafRenderDescriptor(type: LeafType): LeafRenderDescriptor | undefined;

  getNodeRenderDescriptor(node: NodeMetadata): NodeRenderDescriptor;

  addLeaf(node: NodeId, type: LeafType, partial?: Partial<LeafMetadata>): void;
  deleteLeaf(leafId: LeafId): void;

  addNode(node: NodeId, next?: NextMetadata | true): void;
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

  private leafRenderDescriptors: Map<string, LeafRenderDescriptor> = new Map();

  private nodeRenderDescriptor: {
    descriptor: NodeRenderDescriptor;
    fns: ((node: NodeMetadata) => NodeRenderDescriptor)[];
  } = {
    descriptor: {},
    fns: [],
  };

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

    // leaf

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
    ) as Map<string, LeafRenderDescriptor>;

    // node

    let descriptor = {};
    let fns = [];

    for (let plugin of castArray(plugins)) {
      if (!plugin?.nodes?.length) {
        continue;
      }

      for (let node of plugin.nodes) {
        if (typeof node.render === 'function') {
          fns.push(node.render);
        } else {
          merge(descriptor, node.render);
        }
      }
    }

    this.nodeRenderDescriptor = {
      descriptor,
      fns,
    };
  }

  setDefinition(definition: ProcedureDefinition): void {
    this._definition = definition;
    this.emit('update');
  }

  getLeafRenderDescriptors(): LeafRenderDescriptor[] {
    return [...this.leafRenderDescriptors.values()];
  }

  getLeafRenderDescriptor(type: LeafType): LeafRenderDescriptor | undefined {
    return this.leafRenderDescriptors.get(type);
  }

  getNodeRenderDescriptor(node: NodeMetadata): NodeRenderDescriptor {
    return merge(
      this.nodeRenderDescriptor.descriptor,
      ...this.nodeRenderDescriptor.fns.map(fn => fn(node)),
    );
  }

  addLeaf(
    node: NodeId,
    type: LeafType,
    partial: Partial<LeafMetadata> = {},
  ): void {
    void this.update(async definition => {
      let nodeMetadata = definition.nodes.find(({id}) => id === node);

      if (!nodeMetadata) {
        throw Error(`Not found node metadata by id '${node}'`);
      }

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

      nodeMetadata.nexts = nodeMetadata.nexts || [];

      nodeMetadata.nexts.push({type: 'leaf', id});
      definition.leaves.push(metadata);
    });
  }

  deleteLeaf(leafId: LeafId): void {
    void this.update(async definition => {
      let leafIndex = definition.leaves.findIndex(leaf => leaf.id === leafId);
      let nodeMetadata = definition.nodes.find(({nexts}) =>
        nexts?.some(({type, id}) => type === 'leaf' && id === leafId),
      );

      if (!nodeMetadata) {
        throw Error(`Not found node metadata by leaf '${leafId}'`);
      }

      if (leafIndex === -1) {
        if (nodeMetadata) {
          nodeMetadata.nexts = nodeMetadata.nexts?.filter(
            ({type, id}) => type !== 'leaf' || id !== leafId,
          );
        }

        return;
      }

      let leaf = definition.leaves[leafIndex];

      if (
        !(await leafHandler(
          'delete',
          definition,
          this.plugins,
          nodeMetadata.id,
          leaf,
        ))
      ) {
        return;
      }

      definition.leaves.splice(leafIndex, 1);
      nodeMetadata.nexts = nodeMetadata.nexts?.filter(
        ({type, id}) => type !== 'leaf' || id !== leafId,
      );
    });
  }

  /**
   *
   * @param node
   * @param next
   * next = undefined, 创建节点 node 的新子节点分支
   * next = true, 创建新节点并转移节点 node 所有子节点到新节点
   * next = NextMetadata, 创建新节点插入至节点 node 与 next 之间
   */
  addNode(node: NodeId, next?: NextMetadata | true): void {
    void this.update(definition => {
      let nodeMetadata = definition.nodes.find(({id}) => id === node);

      if (!nodeMetadata) {
        throw Error(`Not found node metadata by id '${node}'`);
      }

      let id = createId<NodeId>();

      let newNodeMetadata: NodeMetadata = {id};

      if (typeof next === 'object') {
        let nextMetadataIndex = nodeMetadata.nexts?.findIndex(item =>
          isEqual(item, next),
        );

        if (nextMetadataIndex === undefined || nextMetadataIndex === -1) {
          throw Error(`Not found node next by ${JSON.stringify(next)}`);
        }

        newNodeMetadata.nexts = [nodeMetadata.nexts?.[nextMetadataIndex]!];

        nodeMetadata.nexts?.splice(nextMetadataIndex, 1, {type: 'node', id});
      } else {
        if (next === true) {
          newNodeMetadata.nexts = nodeMetadata.nexts;
          nodeMetadata.nexts = [];
        }

        nodeMetadata.nexts = nodeMetadata.nexts || [];

        nodeMetadata.nexts.push({type: 'node', id});
      }

      definition.nodes.push(newNodeMetadata);
    });
  }

  updateNode(node: NodeMetadata): void {
    void this.update(definition => {
      let nodeIndex = definition.nodes.findIndex(({id}) => id === node.id);

      if (nodeIndex === -1) {
        return;
      }

      definition.nodes.splice(nodeIndex, 1, node);
    });
  }

  getNodeLeaves(node: NodeId): LeafMetadata[] {
    let leavesMap = new Map(
      this._definition.leaves.map(leaf => [leaf.id, leaf]),
    );

    return compact(
      this._definition.nodes
        .find(({id}) => id === node)
        ?.nexts?.map(({type, id}) =>
          type === 'leaf' ? leavesMap.get(id as LeafId) : undefined,
        ),
    );
  }

  private async update(
    handler: (definition: ProcedureDefinition) => Promise<void> | void,
  ): Promise<void> {
    try {
      let definition = await produce(
        this._definition,
        handler,
        (patches, inversePatches) => {
          if (!patches.length) {
            return;
          }

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
    } catch (error) {
      console.error(error);
    }
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
