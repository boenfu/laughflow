import {
  Flow,
  JointMetadata,
  JointRef,
  Leaf,
  LeafRef,
  Node,
  NodeId,
  NodeRef,
  Ref,
  TrunkRef,
} from '@magicflow/core';
import {ProcedureDefinition} from '@magicflow/procedure';
import Eventemitter from 'eventemitter3';
import {castArray} from 'lodash-es';

import {IPlugin, NodePluginComponent, NodePluginRenderObject} from './plugin';

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

export type ProcedureNodeTreeNode = IProcedureTreeNode<NodeRef, Node, true>;

export type ProcedureJointTreeNode = IProcedureTreeNode<
  JointRef,
  JointMetadata,
  true
>;

export type ProcedureLeafTreeNode = IProcedureTreeNode<LeafRef, Leaf, false>;

export type NodeRenderDescriptor = Record<
  keyof NodePluginRenderObject,
  NodePluginComponent[]
>;

type ProcedureEventType = 'update' | 'config';

export interface ActiveTrunk {
  prev: TrunkRef | undefined;
  ref: TrunkRef;
  // 无 / 剪切 / 复制 / 跳转 / 汇入 / 连接
  state: 'none' | 'cutting' | 'copying' | 'connecting' | 'merging' | 'joining';
  relationTrunks?: TrunkRef[];
}

export class Editor extends Eventemitter<ProcedureEventType> {
  readonly procedure: ProcedureDefinition;

  plugins: IPlugin[] = [];

  procedureTreeNode!: ProcedureTreeNode;

  nodeRenderDescriptor: NodeRenderDescriptor = {
    before: [],
    after: [],
    headLeft: [],
    headRight: [],
    body: [],
    footer: [],
    config: [],
  };

  private _activeTrunk: ActiveTrunk | undefined;

  get activeTrunk(): ActiveTrunk | undefined {
    return this._activeTrunk;
  }

  constructor(definition: Flow, plugins: IPlugin[] = []) {
    super();

    this.setPlugins(plugins);
    this.buildTreeNode(definition);

    this.procedure = new ProcedureDefinition(definition, {
      afterDefinitionChange: definition => {
        this.buildTreeNode(definition);
        this.emit('update');
      },
      beforeNodeUpdate: async (
        currentNode: Node,
        nextNode: Node,
        definition,
      ) => {
        if (
          await nodeHandler(
            'onUpdate',
            definition,
            this.plugins,
            currentNode,
            nextNode,
          )
        ) {
          return;
        }

        return 'handled';
      },
    });
  }

  setPlugins(plugins: IPlugin[]): void {
    this.plugins = plugins;

    // node

    for (let plugin of castArray(plugins)) {
      if (!plugin?.node) {
        continue;
      }

      for (let [name, component] of Object.entries(plugin.node.render)) {
        this.nodeRenderDescriptor[name as keyof NodePluginRenderObject].push(
          component,
        );
      }
    }
  }

  setActiveTrunk(activeTrunk: ActiveTrunk | undefined): void {
    this._activeTrunk = activeTrunk;
    this.emit('update');
  }

  buildTreeNode(definition: Flow): void {
    let refTypeToMetadataMapDict: {
      [TType in Ref['type']]: Map<
        string,
        Extract<ProcedureTreeNode, {ref: {type: TType}}>['metadata']
      >;
    } = {
      node: new Map(definition.nodes.map(node => [node.id, node])),
      leaf: new Map(),
      joint: new Map(definition.joints.map(joint => [joint.id, joint])),
    };

    this.procedureTreeNode = buildTreeNode({
      type: 'node',
      id: 'start' as NodeId,
    });

    function buildTreeNode<TProcedureTreeNode extends ProcedureTreeNode>(
      ref: TProcedureTreeNode['ref'],
      prev: ProcedureTreeNode['prev'] = undefined,
      visitedNodeSet: Set<NodeId> = new Set([]),
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

      for (let leafMetadata of (metadata as Node | JointMetadata).leaves ||
        []) {
        refTypeToMetadataMapDict['leaf'].set(leafMetadata.id, leafMetadata);
        leaves.push(
          buildTreeNode(
            {type: 'leaf', id: leafMetadata.id},
            node,
            visitedNodeSet,
            false,
          ),
        );
      }

      for (let next of (metadata as Node | JointMetadata).nexts || []) {
        if (next.type === 'joint') {
          joints.push(
            buildTreeNode(
              next,
              node,
              visitedNodeSet,
              refTypeToMetadataMapDict.joint.get(next.id)?.master?.id !==
                metadata.id
                ? false
                : undefined,
            ),
          );
          continue;
        }

        if (visitedNodeSet.has(next.id)) {
          links.push(buildTreeNode(next, node, visitedNodeSet, false));
        } else {
          visitedNodeSet.add(next.id);
          nodes.push(buildTreeNode(next, node, visitedNodeSet));
        }
      }

      node.nexts = [...leaves, ...nodes, ...joints, ...links];

      return node as TProcedureTreeNode;
    }
  }

  emitConfig<TPayload>(trunkRef: TrunkRef, payload?: TPayload): void {
    if (trunkRef.type === 'joint') {
      // TODO
      return;
    }

    let node = this.procedure.getNode(trunkRef.id);

    this.emit(
      'config',
      this.plugins.reduce<{[key in string]: NodePluginComponent}>(
        (configObject, plugin) => {
          let configComponent = plugin.node?.render.config;

          if (configComponent) {
            configObject[plugin.name] = configComponent;
          }

          return configObject;
        },
        {},
      ),
      {
        editor: this,
        node,
      },
      payload,
    );
  }
}

async function nodeHandler(
  type: 'onUpdate',
  definition: Flow,
  plugins: IPlugin[],
  currentNode: Node,
  nextNode: Node,
): Promise<boolean> {
  let toPropagation = true;
  let toExecuteDefault = true;

  let stopPropagation = (): void => {
    toPropagation = false;
  };
  let preventDefault = (): void => {
    toExecuteDefault = false;
  };

  for (let plugin of plugins) {
    let handler = plugin.node?.[type];

    if (!handler) {
      continue;
    }

    if (!toPropagation) {
      break;
    }

    await handler({
      definition,
      currentNode,
      nextNode,
      stopPropagation,
      preventDefault,
    });
  }

  return toExecuteDefault;
}
