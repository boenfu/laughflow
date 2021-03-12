import {
  JointId,
  JointMetadata,
  JointRef,
  LeafId,
  LeafMetadata,
  LeafRef,
  LeafType,
  NodeId,
  NodeMetadata,
  NodeRef,
  ProcedureDefinition,
  Ref,
  TrunkRef,
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

export interface IProcedureTreeNode<
  TRef extends Ref,
  TMetadata,
  TNexts extends boolean
> {
  prev: ProcedureNodeTreeNode | ProcedureJointTreeNode | undefined;
  ref: TRef;
  metadata: TMetadata;
  nexts: TNexts extends true ? ProcedureTreeNode[] | false : false;
}

export type ProcedureTreeNode =
  | ProcedureNodeTreeNode
  | ProcedureJointTreeNode
  | ProcedureLeafTreeNode;

export type ProcedureNodeTreeNode = IProcedureTreeNode<
  NodeRef,
  NodeMetadata,
  true
>;

export type ProcedureJointTreeNode = IProcedureTreeNode<
  JointRef,
  JointMetadata,
  true
>;

export type ProcedureLeafTreeNode = IProcedureTreeNode<
  LeafRef,
  LeafMetadata,
  false
>;

export interface LeafRenderDescriptor {
  type: LeafType;
  render: LeafPluginComponent;
  selector: LeafSelector;
  actions: LeafAction[];
}

export type NodeRenderDescriptor = NodePluginComponentRender;

type ProcedureEventType = 'update';

interface StatefulNode {
  prev: TrunkRef | undefined;
  node: NodeId;
  type: 'cutting' | 'copying' | 'connecting' | 'join';
}

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

  private _statefulNode: StatefulNode | undefined;

  get statefulNode(): StatefulNode | undefined {
    return this._statefulNode;
  }

  constructor(definition: ProcedureDefinition, plugins: IPlugin[] = []) {
    super();

    this.setPlugins(plugins);
    this.buildTreeNode(definition);

    this.procedure = new Procedure(definition, {
      afterDefinitionChange: definition => {
        this.buildTreeNode(definition);
        this.emit('update');
      },
      async beforeLeafCreate(leaf, node, definition) {
        if (await leafHandler('create', definition, plugins, node.id, leaf)) {
          return;
        }

        return 'handled';
      },
      async beforeLeafDelete(leaf, node, definition) {
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

  setStatefulNode(statefulNode: StatefulNode | undefined): void {
    this._statefulNode = statefulNode;
    this.emit('update');
  }

  buildTreeNode(definition: ProcedureDefinition): void {
    let nodesMap = new Map(definition.nodes.map(node => [node.id, node]));
    let leavesMap = new Map(definition.leaves.map(leaf => [leaf.id, leaf]));
    let jointsMap = new Map(definition.joints.map(joint => [joint.id, joint]));

    this.nodesMap = nodesMap;
    this.leavesMap = leavesMap;

    let refTypeToMetadataMapDict: {
      [TType in Ref['type']]: Map<
        string,
        Extract<ProcedureTreeNode, {ref: {type: TType}}>['metadata']
      >;
    } = {
      node: nodesMap,
      leaf: leavesMap,
      joint: jointsMap,
    };

    this.procedureTreeNode = buildTreeNode({
      type: 'node',
      id: 'start' as NodeId,
    });

    function buildTreeNode<TProcedureTreeNode extends ProcedureTreeNode>(
      ref: TProcedureTreeNode['ref'],
      prev: ProcedureTreeNode['prev'] = undefined,
      visitedNodeSet: Set<NodeId | JointId> = new Set([]),
      hasNexts = true,
    ): TProcedureTreeNode {
      let metadata = refTypeToMetadataMapDict[ref.type].get(ref.id);

      if (!metadata) {
        throw Error(`Not found ${ref.type} metadata by id '${ref.id}'`);
      }

      if (!hasNexts) {
        return {
          prev,
          ref,
          metadata,
          nexts: false,
        } as TProcedureTreeNode;
      }

      let node = ({prev, ref, metadata} as unknown) as NonNullable<
        ProcedureTreeNode['prev']
      >;

      let nodes: ProcedureNodeTreeNode[] = [];
      let leaves: ProcedureLeafTreeNode[] = [];
      let links: ProcedureNodeTreeNode[] = [];
      let joints: ProcedureJointTreeNode[] = [];

      for (let next of (metadata as NodeMetadata | JointMetadata).nexts || []) {
        if (next.type === 'leaf') {
          leaves.push(buildTreeNode(next, node, visitedNodeSet, false));
          continue;
        }

        if (visitedNodeSet.has(next.id)) {
          if (next.type === 'joint') {
            joints.push(buildTreeNode(next, node, visitedNodeSet, false));
          } else {
            links.push(buildTreeNode(next, node, visitedNodeSet, false));
          }
        } else {
          visitedNodeSet.add(next.id);

          if (next.type === 'joint') {
            joints.push(buildTreeNode(next, node, visitedNodeSet));
          } else {
            nodes.push(buildTreeNode(next, node, visitedNodeSet));
          }
        }
      }

      node.nexts = [...leaves, ...nodes, ...joints, ...links];

      return node as TProcedureTreeNode;
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
  trunk: TrunkRef['id'],
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
      trunk,
      stopPropagation,
      preventDefault,
    });
  }

  return toExecuteDefault;
}
