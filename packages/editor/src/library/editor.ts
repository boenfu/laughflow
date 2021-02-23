import {LeafMetadata, LeafType, NodeId, NodeMetadata} from '@magicflow/core';
import {Procedure} from '@magicflow/procedure';
import Eventemitter from 'eventemitter3';
import {castArray, compact, merge, sortBy} from 'lodash-es';
import {Nominal} from 'tslang';

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

type ProcedureEventType = 'update';

export class Editor extends Eventemitter<ProcedureEventType> {
  readonly procedure: Procedure;
  plugins: IPlugin[] = [];

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

    if (plugins.length) {
      this.setPlugins(plugins);
    }

    this.procedure = new Procedure(definition, {
      afterDefinitionChange: () => {
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
