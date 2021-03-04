import {
  LeafId,
  LeafMetadata,
  LeafType,
  NextMetadata,
  NodeId,
  NodeMetadata,
  ProcedureDefinition,
} from '@magicflow/core';
import {Patch, applyPatches, enableAllPlugins, produce} from 'immer';
import {cloneDeep, compact, isEqual, pullAllBy} from 'lodash-es';
import {nanoid} from 'nanoid';

enableAllPlugins();

type ProcedureBeforeListenerReturnType =
  | void
  | 'handled'
  | Promise<void | 'handled'>;

export interface ProcedureListeners {
  afterDefinitionChange?(definition: ProcedureDefinition): void;

  beforeNodeCreate?(
    definition: ProcedureDefinition,
    node: NodeMetadata,
    newNode: NodeMetadata,
  ): ProcedureBeforeListenerReturnType;
  afterNodeCreate?(
    definition: ProcedureDefinition,
    node: NodeMetadata,
    newNode: NodeMetadata,
  ): void;

  beforeNodeDelete?(
    definition: ProcedureDefinition,
    node: NodeMetadata,
    newNode: NodeMetadata,
  ): ProcedureBeforeListenerReturnType;
  afterNodeDelete?(
    definition: ProcedureDefinition,
    node: NodeMetadata,
    newNode: NodeMetadata,
  ): void;

  beforeLeafCreate?(
    definition: ProcedureDefinition,
    node: NodeMetadata,
    leaf: LeafMetadata,
  ): ProcedureBeforeListenerReturnType;
  afterLeafCreate?(
    definition: ProcedureDefinition,
    node: NodeMetadata,
    leaf: LeafMetadata,
  ): void;

  beforeLeafDelete?(
    definition: ProcedureDefinition,
    node: NodeMetadata,
    leaf: LeafMetadata,
  ): ProcedureBeforeListenerReturnType;
  afterLeafDelete?(
    definition: ProcedureDefinition,
    node: NodeMetadata,
    leaf: LeafMetadata,
  ): void;
}

export interface IProcedure {
  listeners: ProcedureListeners;
  definition: ProcedureDefinition;

  createLeaf(
    node: NodeId,
    type: LeafType,
    partial?: Partial<LeafMetadata>,
  ): void;
  deleteLeaf(leafId: LeafId): void;

  createNode(node: NodeId, next?: NextMetadata | 'next'): void;
  updateNode(node: NodeMetadata): void;
  deleteNode(node: NodeId, includeNextNodes?: boolean): void;
  moveNode(
    movingNode: NodeId,
    originNode: NodeId | undefined,
    targeNode: NodeId,
    targetAfterNode: NodeId | undefined,
  ): void;
  copyNode(copyingNode: NodeId, targeNode: NodeId): void;

  undo(): void;
  redo(): void;
}

interface ProcedureActionStack {
  undoes: Patch[][];
  redoes: Patch[][];
  cursor: number;
}

export class Procedure implements IProcedure {
  private _definition!: ProcedureDefinition;

  private actionStack: ProcedureActionStack = {
    undoes: [],
    redoes: [],
    cursor: -1,
  };

  get definition(): ProcedureDefinition {
    return this._definition;
  }

  constructor(
    definition: ProcedureDefinition,
    readonly listeners: ProcedureListeners = {},
  ) {
    this.setDefinition(cloneDeep(definition), false);
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

  createLeaf(
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
        (await this.listeners.beforeLeafCreate?.(
          definition,
          nodeMetadata,
          metadata,
        )) === 'handled'
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
        (await this.listeners.beforeLeafDelete?.(
          definition,
          nodeMetadata,
          leaf,
        )) === 'handled'
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
   * @param target
   *  1. next = undefined, 创建节点 node 的新子节点分支
   *  2. next = 'next', 创建新节点并转移节点 node 所有子节点到新节点
   *  3. next = NextMetadata, 创建新节点插入至节点 node 与 next 之间
   * @param metadata
   */
  createNode(
    node: NodeId,
    target: NextMetadata | 'next' | undefined = undefined,
    {id: _id, nexts = [], ...partial}: Partial<NodeMetadata> = {},
  ): void {
    void this.update(definition => {
      let nodeMetadata = definition.nodes.find(({id}) => id === node);

      if (!nodeMetadata) {
        throw Error(`Not found node metadata by id '${node}'`);
      }

      let id = createId<NodeId>();

      let newNodeMetadata: NodeMetadata = {...partial, id, nexts};

      if (typeof target === 'object') {
        let nextMetadataIndex = nodeMetadata.nexts?.findIndex(item =>
          isEqual(item, target),
        );

        if (nextMetadataIndex === undefined || nextMetadataIndex === -1) {
          throw Error(`Not found node next by ${JSON.stringify(target)}`);
        }

        newNodeMetadata.nexts!.push(nodeMetadata.nexts?.[nextMetadataIndex]!);
        nodeMetadata.nexts!.splice(nextMetadataIndex, 1, {type: 'node', id});
      } else {
        if (target === 'next' && nodeMetadata.nexts?.length) {
          newNodeMetadata.nexts!.push(...nodeMetadata.nexts);
          nodeMetadata.nexts = [];
        }

        nodeMetadata.nexts = nodeMetadata.nexts || [];
        nodeMetadata.nexts.push({type: 'node', id});
      }

      definition.nodes.push(newNodeMetadata);
    });
  }

  connectNode(node: NodeId, next: NextMetadata): void {
    void this.update(definition => {
      let nodeMetadata = definition.nodes.find(({id}) => id === node);

      if (!nodeMetadata) {
        throw Error(`Not found node metadata by id '${node}'`);
      }

      nodeMetadata.nexts = nodeMetadata.nexts || [];

      nodeMetadata.nexts.push(next);
    });
  }

  disconnectNode(node: NodeId, next: NextMetadata): void {
    void this.update(definition => {
      let nodeMetadata = definition.nodes.find(({id}) => id === node);

      if (!nodeMetadata) {
        throw Error(`Not found node metadata by id '${node}'`);
      }

      nodeMetadata.nexts = (nodeMetadata.nexts || []).filter(
        ({id}) => id !== next.id,
      );
    });
  }

  updateNode(metadata: NodeMetadata): void {
    void this.update(definition => {
      let nodeIndex = definition.nodes.findIndex(({id}) => id === metadata.id);

      if (nodeIndex === -1) {
        throw Error(`Not found node metadata by id '${metadata.id}'`);
      }

      definition.nodes.splice(nodeIndex, 1, metadata);
    });
  }

  deleteNode(node: NodeId, includeNexts = false): void {
    void this.update(definition => {
      let nodesMap: Map<NodeId, NodeMetadata> = new Map();
      let nodeBeforeNodesMap: Map<NodeId, NodeId[]> = new Map();

      for (let node of definition.nodes) {
        nodesMap.set(node.id, node);

        for (let next of node.nexts || []) {
          if (next.type !== 'node') {
            continue;
          }

          nodeBeforeNodesMap.set(next.id, [
            ...(nodeBeforeNodesMap.get(next.id) || []),
            node.id,
          ]);
        }
      }

      if (!nodesMap.has(node)) {
        throw Error(`Not found node metadata by id '${node}'`);
      }

      let checkingNodes: NodeId[] = [node];
      let pendingDeleteNodesSet: Set<NodeId> = new Set();
      let pendingDeleteLeavesSet: Set<LeafId> = new Set();

      while (checkingNodes.length) {
        let node = checkingNodes.shift()!;
        let beforeNodesLength = nodeBeforeNodesMap.get(node)?.length || 0;

        if (beforeNodesLength > 1) {
          throw Error(`'${node}' used multiple times`);
        }

        let metadata = nodesMap.get(node);

        pendingDeleteNodesSet.add(node);

        if (!metadata || !includeNexts) {
          continue;
        }

        for (let next of metadata.nexts || []) {
          if (next.type === 'leaf') {
            pendingDeleteLeavesSet.add(next.id);
            continue;
          }

          pendingDeleteNodesSet.add(next.id);
          checkingNodes.push(next.id);
        }
      }

      definition.nodes = compact(
        definition.nodes.map(node => {
          if (pendingDeleteNodesSet.has(node.id)) {
            return undefined;
          }

          node.nexts = node.nexts?.filter(next =>
            next.type === 'node' ? !pendingDeleteNodesSet.has(next.id) : true,
          );

          return node;
        }),
      );
      definition.leaves = definition.leaves.filter(
        node => !pendingDeleteLeavesSet.has(node.id),
      );
    });
  }

  moveNode(
    movingNodeId: NodeId,
    originNodeId: NodeId | undefined,
    targeNodeId: NodeId,
    targetAfterNodeId: NodeId | undefined,
  ): void {
    if (movingNodeId === targeNodeId) {
      return;
    }

    void this.update(definition => {
      let nodesMap = new Map(definition.nodes.map(node => [node.id, node]));

      let movingNode = nodesMap.get(movingNodeId);
      let originNode = originNodeId && nodesMap.get(originNodeId);
      let targeNode = nodesMap.get(targeNodeId);
      let targetAfterNode =
        targetAfterNodeId && nodesMap.get(targetAfterNodeId);

      console.log(targetAfterNode);

      if (!movingNode) {
        throw Error(`Not found movingNode metadata by id '${movingNodeId}'`);
      }

      if (!targeNode) {
        throw Error(`Not found targeNode metadata by id '${targeNodeId}'`);
      }

      let pendingTransferMovingNodeNexts = movingNode.nexts?.length
        ? pullAllBy(movingNode.nexts, [{type: 'leaf'}], 'type')
        : [];

      if (originNode) {
        originNode.nexts = originNode.nexts || [];
        originNode.nexts.push(...pendingTransferMovingNodeNexts);
      }
    });
  }

  copyNode(copyingNode: NodeId, targeNode: NodeId): void {
    console.log(copyingNode, targeNode);

    // void this.update(definition => {
    //   let nodeIndex = definition.nodes.findIndex(({id}) => id === metadata.id);
    //   if (nodeIndex === -1) {
    //     throw Error(`Not found node metadata by id '${metadata.id}'`);
    //   }
    //   definition.nodes.splice(nodeIndex, 1, metadata);
    // });
  }

  async update(
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

  private setDefinition(definition: ProcedureDefinition, notify = true): void {
    this._definition = definition;
    // this.buildMetadataMap(definition);

    if (!notify) {
      return;
    }

    this.listeners.afterDefinitionChange?.(definition);
  }

  // private buildMetadataMap(definition: ProcedureDefinition): void {
  //   this.nodesMap = new Map(definition.nodes.map(node => [node.id, node]));
  //   this.leavesMap = new Map(definition.leaves.map(leaf => [leaf.id, leaf]));
  // }
}

export function createId<TId>(): TId {
  return (nanoid(8) as unknown) as TId;
}
