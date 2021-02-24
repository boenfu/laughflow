import {
  LeafId,
  LeafMetadata,
  LeafType,
  NodeId,
  NodeMetadata,
  ProcedureDefinition,
} from '@magicflow/core';
import {Procedure} from '@magicflow/procedure';
import Eventemitter from 'eventemitter3';
import {castArray, compact, merge, sortBy} from 'lodash-es';

import {doneLeaf, terminateLeaf} from './components';
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
} from './plugin';

export interface ProcedureTreeNode {
  metadata: NodeMetadata;
  nodes: ProcedureTreeNode[];
  leaves: LeafMetadata[];
  links: NodeMetadata[];
}

export interface LeafRenderDescriptor {
  type: LeafType;
  render: LeafPluginComponent;
  selector: LeafSelector;
  actions: LeafAction[];
}

export type NodeRenderDescriptor = NodePluginComponentRender;

type ProcedureEventType = 'update';

export class Editor extends Eventemitter<ProcedureEventType> {
  readonly procedure: Procedure;
  plugins: IPlugin[] = [];

  procedureTreeNode!: ProcedureTreeNode;

  nodesMap!: Map<NodeId, NodeMetadata>;
  leavesMap!: Map<LeafId, LeafMetadata>;

  private leafRenderDescriptors: Map<string, LeafRenderDescriptor> = new Map();

  private nodeRenderDescriptor: {
    descriptor: NodeRenderDescriptor;
    fns: ((node: NodeMetadata) => NodeRenderDescriptor)[];
  } = {
    descriptor: {},
    fns: [],
  };

  constructor(definition: ProcedureDefinition, plugins: IPlugin[] = []) {
    super();

    this.setPlugins(plugins);
    this.buildTreeNode(definition);

    this.procedure = new Procedure(definition, {
      afterDefinitionChange: definition => {
        this.buildTreeNode(definition);
        this.emit('update');
      },
      async beforeLeafCreate(definition, node, leaf) {
        if (await leafHandler('create', definition, plugins, node.id, leaf)) {
          return;
        }

        return 'handled';
      },
      async beforeLeafDelete(definition, node, leaf) {
        if (await leafHandler('delete', definition, plugins, node.id, leaf)) {
          return;
        }

        return 'handled';
      },
    });
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

  buildTreeNode(definition: ProcedureDefinition): void {
    let nodesMap = new Map(definition.nodes.map(node => [node.id, node]));
    let leavesMap = new Map(definition.leaves.map(leaf => [leaf.id, leaf]));

    this.nodesMap = nodesMap;
    this.leavesMap = leavesMap;

    this.procedureTreeNode = buildTreeNode('start' as NodeId);

    function buildTreeNode(
      node: NodeId,
      visitedNodeSet: Set<NodeId> = new Set(),
    ): ProcedureTreeNode {
      let metadata = nodesMap.get(node);

      if (!metadata) {
        throw Error(`Not found node metadata by id '${node}'`);
      }

      let nodes: ProcedureTreeNode[] = [];
      let leaves: LeafMetadata[] = [];
      let links: NodeMetadata[] = [];

      for (let next of metadata.nexts || []) {
        if (next.type === 'leaf') {
          if (!leavesMap.has(next.id)) {
            console.warn(`Not found leaf metadata by id '${next.id}'`);
            continue;
          }

          leaves.push(leavesMap.get(next.id)!);
        } else {
          let nextNodeMetadata = nodesMap.get(next.id);

          if (!nextNodeMetadata) {
            console.warn(`Not found node metadata by id '${next.id}'`);
            continue;
          }

          if (!visitedNodeSet.has(next.id)) {
            visitedNodeSet.add(next.id);

            nodes.push(buildTreeNode(next.id, visitedNodeSet));
          } else {
            links.push(nextNodeMetadata);
          }
        }
      }

      return {
        metadata,
        nodes,
        leaves,
        links,
      };
    }
  }
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
