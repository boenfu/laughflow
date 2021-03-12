import {
  JointId,
  JointMetadata,
  LeafId,
  LeafMetadata,
  LeafType,
  NodeId,
  NodeMetadata,
  NodeRef,
  ProcedureDefinition,
  Ref,
  TrunkRef,
} from '@magicflow/core';
import {Patch, applyPatches, enableAllPlugins, produce} from 'immer';
import {cloneDeep, compact, isEqual} from 'lodash-es';
import {nanoid} from 'nanoid';

enableAllPlugins();

type ProcedureBeforeListenerReturnType =
  | void
  | 'handled'
  | Promise<void | 'handled'>;

export interface ProcedureListeners<
  TProcedureDefinition extends ProcedureDefinition
> {
  afterDefinitionChange?(definition: TProcedureDefinition): void;

  beforeLeafCreate?(
    leaf: TProcedureDefinition['leaves'][number],
    trunk:
      | TProcedureDefinition['nodes'][number]
      | TProcedureDefinition['joints'][number],
    definition: TProcedureDefinition,
  ): ProcedureBeforeListenerReturnType;

  beforeLeafDelete?(
    leaf: TProcedureDefinition['leaves'][number],
    node:
      | TProcedureDefinition['nodes'][number]
      | TProcedureDefinition['joints'][number],
    definition: TProcedureDefinition,
  ): ProcedureBeforeListenerReturnType;
}

export interface IProcedure<
  TProcedureDefinition extends ProcedureDefinition = ProcedureDefinition
> {
  definition: TProcedureDefinition;
  listeners: ProcedureListeners<TProcedureDefinition>;

  createLeaf(
    trunk: TrunkRef,
    type: LeafType,
    partial?: Partial<LeafMetadata>,
  ): void;
  updateLeaf(leaf: LeafMetadata): void;
  deleteLeaf(leafId: LeafId): void;

  createJoint(trunk: TrunkRef, otherTrunk: TrunkRef): void;
  deleteJoint(joint: JointId): void;

  createNode(trunk: TrunkRef, next: Ref | 'next' | undefined): void;
  connectNode(trunk: TrunkRef, node: NodeRef): void;
  disconnectNode(trunk: TrunkRef, node: NodeRef): void;
  updateNode(node: NodeMetadata): void;
  deleteNode(node: NodeId, prev: TrunkRef | undefined): void;
  moveNode(
    movingNode: NodeId,
    prev: TrunkRef | undefined,
    target: TrunkRef,
    targetNext: Ref | undefined,
  ): void;
  copyNode(
    copyingNode: NodeId,
    target: TrunkRef,
    targetNext: Ref | undefined,
  ): void;

  undo(): void;
  redo(): void;
}

interface ProcedureActionStack {
  undoes: Patch[][];
  redoes: Patch[][];
  cursor: number;
}

export class Procedure<
  TProcedureDefinition extends ProcedureDefinition = ProcedureDefinition
> implements IProcedure {
  private _definition!: TProcedureDefinition;

  private actionStack: ProcedureActionStack = {
    undoes: [],
    redoes: [],
    cursor: -1,
  };

  get definition(): TProcedureDefinition {
    return this._definition;
  }

  constructor(
    definition: TProcedureDefinition,
    readonly listeners: ProcedureListeners<TProcedureDefinition> = {},
  ) {
    this.setDefinition(cloneDeep(definition), false);
  }

  getNode(nodeId: NodeId): TProcedureDefinition['nodes'][number] | undefined {
    return this.definition.nodes.find(node => node.id === nodeId);
  }

  getLeaf(leafId: LeafId): TProcedureDefinition['leaves'][number] | undefined {
    return this.definition.leaves.find(leaf => leaf.id === leafId);
  }

  getJoint(
    jointId: JointId,
  ): TProcedureDefinition['joints'][number] | undefined {
    return this.definition.joints.find(joint => joint.id === jointId);
  }

  async createLeaf(
    trunk: TrunkRef,
    type: LeafType,
    partial: Partial<TProcedureDefinition['leaves'][number]> = {},
  ): Promise<void> {
    return this.update(async definition => {
      let trunkMetadata = requireTrunk(definition, trunk);

      let id = createId<LeafId>();
      let metadata = {
        ...partial,
        id,
        type,
      };

      if (
        (await this.listeners.beforeLeafCreate?.(
          metadata,
          trunkMetadata,
          definition,
        )) === 'handled'
      ) {
        return;
      }

      trunkMetadata.nexts = trunkMetadata.nexts || [];
      trunkMetadata.nexts.push({type: 'leaf', id});

      definition.leaves.push(metadata);
    });
  }

  async updateLeaf(
    metadata: TProcedureDefinition['leaves'][number],
  ): Promise<void> {
    return this.update(definition => {
      let leafIndex = definition.leaves.findIndex(({id}) => id === metadata.id);

      if (leafIndex === -1) {
        throw Error(`Not found leaf metadata by id '${metadata.id}'`);
      }

      definition.leaves.splice(leafIndex, 1, metadata);
    });
  }

  async deleteLeaf(leafId: LeafId): Promise<void> {
    return this.update(async definition => {
      let leafIndex = definition.leaves.findIndex(leaf => leaf.id === leafId);

      if (leafIndex === -1) {
        throw Error(`Not found leaf metadata by leaf '${leafId}'`);
      }

      let trunkMetadata =
        definition.nodes.find(({nexts}) =>
          nexts?.some(({type, id}) => type === 'leaf' && id === leafId),
        ) ||
        definition.joints.find(({nexts}) =>
          nexts?.some(({type, id}) => type === 'leaf' && id === leafId),
        );

      if (!trunkMetadata) {
        definition.leaves.splice(leafIndex, 1);
        return;
      }

      let leaf = definition.leaves[leafIndex];

      if (
        (await this.listeners.beforeLeafDelete?.(
          leaf,
          trunkMetadata,
          definition,
        )) === 'handled'
      ) {
        return;
      }

      definition.leaves.splice(leafIndex, 1);

      trunkMetadata.nexts = trunkMetadata.nexts?.filter(
        ({type, id}) => type !== 'leaf' || id !== leafId,
      );
    });
  }

  async createJoint(trunk: TrunkRef, otherTrunk: TrunkRef): Promise<void> {
    return this.update(async definition => {
      let trunkMetadata = requireTrunk(definition, trunk);
      let otherTrunkMetadata = requireTrunk(definition, otherTrunk);

      // TODO (boen): 检查两个节点是否前后，是的话就无法添加

      let id = createId<JointId>();

      trunkMetadata.nexts = trunkMetadata.nexts || [];
      otherTrunkMetadata.nexts = otherTrunkMetadata.nexts || [];

      trunkMetadata.nexts.push({type: 'joint', id});
      otherTrunkMetadata.nexts.push({type: 'joint', id});

      definition.joints.push({id});
    });
  }

  async deleteJoint(jointId: JointId): Promise<void> {
    return this.update(async definition => {
      let jointMetadataIndex = definition.joints.findIndex(
        joint => joint.id === jointId,
      );

      if (jointMetadataIndex === -1) {
        throw Error(`Not found joint metadata by id '${jointId}'`);
      }

      let [jointMetadata] = definition.joints.splice(jointMetadataIndex, 1);

      definition.nodes = definition.nodes.map(node => {
        node.nexts =
          node.nexts && node.nexts.filter(next => next.id !== jointId);
        return node;
      });

      if (!jointMetadata.nexts?.length) {
        return;
      }

      let leavesSet = new Set<LeafId>(
        compact(
          jointMetadata.nexts.map(next =>
            next.type === 'leaf' ? next.id : undefined,
          ),
        ),
      );

      definition.leaves = definition.leaves.filter(
        leaf => !leavesSet.has(leaf.id),
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
  async createNode(
    trunk: TrunkRef,
    target: Ref | 'next' | undefined = undefined,
    {
      id: _id,
      nexts = [],
      ...partial
    }: Partial<TProcedureDefinition['nodes'][number]> = {},
  ): Promise<void> {
    return this.update(definition => {
      let trunkMetadata = requireTrunk(definition, trunk);

      let id = createId<NodeId>();

      let newNodeMetadata: NodeMetadata = {...partial, id, nexts};

      if (typeof target === 'object') {
        let nextMetadataIndex = trunkMetadata.nexts?.findIndex(item =>
          isEqual(item, target),
        );

        if (nextMetadataIndex === undefined || nextMetadataIndex === -1) {
          throw Error(`Not found node next by ${JSON.stringify(target)}`);
        }

        newNodeMetadata.nexts!.push(trunkMetadata.nexts![nextMetadataIndex]);
        trunkMetadata.nexts!.splice(nextMetadataIndex, 1, {type: 'node', id});
      } else {
        if (
          target === 'next' &&
          trunkMetadata.nexts &&
          trunkMetadata.nexts.length
        ) {
          newNodeMetadata.nexts!.push(...trunkMetadata.nexts);
          trunkMetadata.nexts = [];
        }

        trunkMetadata.nexts = trunkMetadata.nexts || [];
        trunkMetadata.nexts.push({type: 'node', id});
      }

      definition.nodes.push(newNodeMetadata);
    });
  }

  async connectNode(trunk: TrunkRef, node: NodeRef): Promise<void> {
    return this.update(definition => {
      let trunkMetadata = requireTrunk(definition, trunk);

      trunkMetadata.nexts = trunkMetadata.nexts || [];

      trunkMetadata.nexts.push(node);
    });
  }

  async disconnectNode(trunk: TrunkRef, node: NodeRef): Promise<void> {
    return this.update(definition => {
      let trunkMetadata = requireTrunk(definition, trunk);

      if (!trunkMetadata.nexts?.length) {
        return;
      }

      trunkMetadata.nexts = trunkMetadata.nexts.filter(
        ({id}) => id !== node.id,
      );
    });
  }

  async updateNode(
    metadata: TProcedureDefinition['nodes'][number],
  ): Promise<void> {
    return this.update(definition => {
      let nodeIndex = definition.nodes.findIndex(({id}) => id === metadata.id);

      if (nodeIndex === -1) {
        throw Error(`Not found node metadata by id '${metadata.id}'`);
      }

      definition.nodes.splice(nodeIndex, 1, metadata);
    });
  }

  async deleteNode(nodeId: NodeId, prev: TrunkRef | undefined): Promise<void> {
    return this.update(definition => {
      let nodesMap = new Map(definition.nodes.map(node => [node.id, node]));
      let jointsMap = new Map(
        definition.joints.map(joint => [joint.id, joint]),
      );

      let node = nodesMap.get(nodeId);

      if (!node) {
        throw Error(`Not found node metadata by id '${nodeId}'`);
      }

      let prevMetadata = prev
        ? prev.type === 'node'
          ? nodesMap.get(prev.id)
          : jointsMap.get(prev.id)
        : undefined;

      if (prev) {
        if (!prevMetadata) {
          throw Error(
            `Not found node or joint metadata by id '${JSON.stringify(prev)}'`,
          );
        }

        if (!prevMetadata.nexts?.some(next => next.id === nodeId)) {
          throw Error(
            `Not found node '${nodeId}' at nexts of prevNode '${JSON.stringify(
              prev,
            )}'`,
          );
        }
      }

      let visitedNodesSet: Set<NodeId> = new Set();

      let checkingNodes = getTypeNextIds<NodeRef>(node, 'node');

      while (checkingNodes.length) {
        let checkingNodeId = checkingNodes.shift()!;

        if (checkingNodeId === nodeId) {
          throw Error(
            `Delete node '${nodeId}' failed because delete path with cycle`,
          );
        }

        let checkingNode = nodesMap.get(checkingNodeId)!;

        if (!checkingNode) {
          throw Error(`Not found node metadata by id '${checkingNodeId}'`);
        }

        if (visitedNodesSet.has(checkingNodeId)) {
          continue;
        }

        visitedNodesSet.add(checkingNode.id);

        checkingNodes.push(...getTypeNextIds<NodeRef>(checkingNode, 'node'));
      }

      definition.nodes = compact(
        definition.nodes.map(node => {
          if (node.id === nodeId) {
            return undefined;
          }

          node.nexts = node.nexts?.filter(next => next.id !== nodeId);

          return node;
        }),
      );

      if (!prevMetadata || !node.nexts?.length) {
        return;
      }

      // 删除 nexts 中的 leaves
      let nexts: Ref[] = [];
      let leafNextsSet = new Set<LeafId>();

      for (let next of node.nexts) {
        if (next.type === 'leaf') {
          leafNextsSet.add(next.id);
        } else {
          nexts.push(next);
        }
      }

      (prevMetadata as NodeMetadata).nexts!.push(...nexts);
      definition.leaves = definition.leaves.filter(
        leaf => !leafNextsSet.has(leaf.id),
      );
    });
  }

  async moveNode(
    movingNodeId: NodeId,
    prev: TrunkRef | undefined,
    target: TrunkRef,
    targetNext: Ref | undefined,
  ): Promise<void> {
    if (movingNodeId === target.id) {
      return;
    }

    return this.update(definition => {
      let movingNode = requireTrunk(definition, {
        type: 'node',
        id: movingNodeId,
      });
      let targetTrunk = requireTrunk(definition, target);

      let movingNodeNexts = movingNode.nexts || [];
      let pendingTransferMovingNodeNexts = [];

      movingNode.nexts = [];

      // The leaves will move with the node
      for (let next of movingNodeNexts) {
        if (next.type === 'leaf') {
          movingNode.nexts.push(next);
          continue;
        }

        pendingTransferMovingNodeNexts.push(next);
      }

      if (prev) {
        let prevTrunk = requireTrunk(definition, prev);

        prevTrunk.nexts = prevTrunk.nexts || [];

        let movingNodeIndex = prevTrunk.nexts.findIndex(
          next => next.id === movingNodeId,
        );

        if (movingNodeIndex === -1) {
          throw Error(
            `Not found movingNode '${movingNodeId}' at nexts of prevNode '${prev.id}'`,
          );
        }

        prevTrunk.nexts.splice(
          movingNodeIndex,
          1,
          ...pendingTransferMovingNodeNexts,
        );
      }

      targetTrunk.nexts = targetTrunk.nexts || [];

      if (targetNext) {
        let targetNextIndex = targetTrunk.nexts.findIndex(
          next => next.id === targetNext.id,
        );

        if (targetNextIndex === -1) {
          throw Error(
            `Not found targetNext ${JSON.stringify(
              targetNext,
            )} at nexts of targetNode '${targetTrunk.id}'`,
          );
        }

        targetTrunk.nexts.splice(targetNextIndex, 1);

        movingNode.nexts.push(targetNext);
      }

      targetTrunk.nexts.push({
        type: 'node',
        id: movingNodeId,
      });
    });
  }

  async copyNode(
    copyingNodeId: NodeId,
    target: TrunkRef,
    targetNext: Ref | undefined,
  ): Promise<void> {
    return this.update(definition => {
      let copyingNode = requireTrunk(definition, {
        type: 'node',
        id: copyingNodeId,
      });
      let targetTrunk = requireTrunk(definition, target);

      let duplicateNodeId = createId<NodeId>();
      let duplicateNode = cloneDeep(copyingNode);

      duplicateNode.id = duplicateNodeId;
      duplicateNode.nexts = [];

      targetTrunk.nexts = targetTrunk.nexts || [];

      if (!targetNext) {
        targetTrunk.nexts.push({
          type: 'node',
          id: duplicateNodeId,
        });
        definition.nodes.push(duplicateNode);

        return;
      }

      let nextIndex = targetTrunk.nexts.findIndex(next =>
        isEqual(next, targetNext),
      );

      if (nextIndex === -1) {
        throw Error(
          `Not found next metadata ${JSON.stringify(targetNext)} at node '${
            targetTrunk.id
          }'`,
        );
      }

      targetTrunk.nexts.splice(nextIndex, 1, {
        type: 'node',
        id: duplicateNodeId,
      });
      duplicateNode.nexts.push(targetNext);
      definition.nodes.push(duplicateNode);
    });
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

  async update(
    handler: (definition: TProcedureDefinition) => Promise<void> | void,
  ): Promise<void> {
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
  }

  private setDefinition(definition: TProcedureDefinition, notify = true): void {
    this._definition = definition;

    if (!notify) {
      return;
    }

    this.listeners.afterDefinitionChange?.(definition);
  }
}

export function createId<TId>(): TId {
  return (nanoid(8) as unknown) as TId;
}

function getTypeNextIds<TNextMetadata extends Ref>(
  node: NodeMetadata,
  type: TNextMetadata['type'],
): TNextMetadata['id'][] {
  if (!node.nexts?.length) {
    return [];
  }

  let typeNextIds: TNextMetadata['id'][] = [];

  for (let next of node.nexts) {
    if (next.type !== type) {
      continue;
    }

    typeNextIds.push(next.id);
  }

  return typeNextIds;
}

function requireTrunk<TTrunkRef extends TrunkRef>(
  definition: ProcedureDefinition,
  trunkRef: TTrunkRef,
): {node: NodeMetadata; joint: JointMetadata}[TTrunkRef['type']] {
  let trunkMetadata =
    trunkRef.type === 'node'
      ? definition.nodes.find(({id}) => id === trunkRef.id)
      : definition.joints.find(({id}) => id === trunkRef.id);

  if (!trunkMetadata) {
    throw Error(`Not found ${trunkRef.type} metadata by id '${trunkRef.id}'`);
  }

  return trunkMetadata as {
    node: NodeMetadata;
    joint: JointMetadata;
  }[TTrunkRef['type']];
}
