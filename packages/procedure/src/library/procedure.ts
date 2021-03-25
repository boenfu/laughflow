import {
  JointId,
  JointMetadata,
  JointRef,
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
import {castArray, cloneDeep, compact, isEqual} from 'lodash-es';
import {nanoid} from 'nanoid';

enableAllPlugins();

type ProcedureBeforeListenerReturnType =
  | void
  | 'handled'
  | Promise<void | 'handled'>;

export interface ProcedureListeners {
  afterDefinitionChange?(definition: ProcedureDefinition): void;

  beforeLeafCreate?(
    leaf: LeafMetadata,
    trunk: NodeMetadata | JointMetadata,
    definition: ProcedureDefinition,
  ): ProcedureBeforeListenerReturnType;

  beforeLeafDelete?(
    leaf: LeafMetadata,
    trunk: NodeMetadata | JointMetadata,
    definition: ProcedureDefinition,
  ): ProcedureBeforeListenerReturnType;

  beforeNodeUpdate?(
    currentNode: NodeMetadata,
    nextNode: NodeMetadata,
    definition: ProcedureDefinition,
  ): ProcedureBeforeListenerReturnType;
}

export interface IProcedure {
  definition: ProcedureDefinition;
  listeners: ProcedureListeners;

  createLeaf(
    trunk: TrunkRef,
    type: LeafType,
    partial?: Partial<LeafMetadata>,
  ): void;
  updateLeaf(trunk: TrunkRef, leaf: LeafMetadata): void;
  deleteLeaf(trunk: TrunkRef, leafId: LeafId): void;

  createJoint(trunk: TrunkRef, otherTrunks: TrunkRef | TrunkRef[]): void;
  connectJoint(joint: JointRef, otherTrunks: TrunkRef | TrunkRef[]): void;
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

export class Procedure implements IProcedure {
  private _definition!: ProcedureDefinition;

  private actionStack: ProcedureActionStack = {
    undoes: [],
    redoes: [],
    cursor: -1,
  };

  get undoAble(): boolean {
    return !!this.actionStack.undoes?.[this.actionStack.cursor + 1];
  }

  get redoAble(): boolean {
    return !!this.actionStack.redoes?.[this.actionStack.cursor];
  }

  get definition(): ProcedureDefinition {
    return this._definition;
  }

  constructor(
    definition: ProcedureDefinition,
    readonly listeners: ProcedureListeners = {},
  ) {
    this.setDefinition(cloneDeep(definition), false);
  }

  getNode(nodeId: NodeId): NodeMetadata | undefined {
    return this.definition.nodes.find(node => node.id === nodeId);
  }

  getJoint(jointId: JointId): JointMetadata | undefined {
    return this.definition.joints.find(joint => joint.id === jointId);
  }

  async createLeaf(
    trunk: TrunkRef,
    type: LeafType,
    partial: Partial<LeafMetadata> = {},
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

      trunkMetadata.leaves = trunkMetadata.leaves || [];
      trunkMetadata.leaves.push(metadata);
    });
  }

  async updateLeaf(trunkRef: TrunkRef, metadata: LeafMetadata): Promise<void> {
    return this.update(definition => {
      let trunkMetadata = requireTrunk(definition, trunkRef);

      let leafIndex = trunkMetadata.leaves?.findIndex(
        ({id}) => id === metadata.id,
      );

      if (leafIndex === undefined || leafIndex === -1) {
        throw Error(`Not found leaf metadata by id '${metadata.id}'`);
      }

      trunkMetadata.leaves!.splice(leafIndex, 1, metadata);
    });
  }

  async deleteLeaf(trunkRef: TrunkRef, leafId: LeafId): Promise<void> {
    return this.update(async definition => {
      let trunkMetadata = requireTrunk(definition, trunkRef);

      let leafIndex = trunkMetadata.leaves?.findIndex(
        leaf => leaf.id === leafId,
      );

      if (leafIndex === undefined || leafIndex === -1) {
        throw Error(`Not found leaf metadata by leaf '${leafId}'`);
      }

      let leaf = trunkMetadata.leaves![leafIndex];

      if (
        (await this.listeners.beforeLeafDelete?.(
          leaf,
          trunkMetadata,
          definition,
        )) === 'handled'
      ) {
        return;
      }

      trunkMetadata.leaves!.splice(leafIndex, 1);
    });
  }

  async createJoint(
    trunk: TrunkRef,
    otherTrunks: TrunkRef | TrunkRef[],
  ): Promise<void> {
    return this.update(async definition => {
      let trunkMetadata = requireTrunk(definition, trunk);
      let otherTrunksMetadata = requireTrunks(
        definition,
        castArray(otherTrunks),
      );

      // TODO (boen): 检查是否存在节点是前后关系，是的话就无需添加

      let id = createId<JointId>();

      trunkMetadata.nexts = trunkMetadata.nexts || [];

      trunkMetadata.nexts.push({type: 'joint', id});

      for (let otherTrunkMetadata of otherTrunksMetadata) {
        otherTrunkMetadata.nexts = otherTrunkMetadata.nexts || [];
        otherTrunkMetadata.nexts.push({type: 'joint', id});
      }

      definition.joints.push({id, master: trunk});
    });
  }

  async connectJoint(
    joint: JointRef,
    _otherTrunks: TrunkRef | TrunkRef[],
  ): Promise<void> {
    return this.update(async definition => {
      let jointMetadata = requireTrunk(definition, joint);
      let otherTrunks = castArray(_otherTrunks);

      requireTrunks(definition, castArray(otherTrunks));

      jointMetadata.nexts = jointMetadata.nexts || [];
      jointMetadata.nexts.push(...otherTrunks);
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

      let masterTrunk = requireTrunk(definition, jointMetadata.master);

      masterTrunk.nexts = masterTrunk.nexts || [];
      masterTrunk.nexts.push(...jointMetadata.nexts);
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
    {id: _id, nexts = [], ...partial}: Partial<NodeMetadata> = {},
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

  async updateNode(metadata: NodeMetadata): Promise<void> {
    let nextNodeMetadata = cloneDeep(metadata);

    return this.update(async definition => {
      let nodeIndex = definition.nodes.findIndex(({id}) => id === metadata.id);

      if (nodeIndex === -1) {
        throw Error(`Not found node metadata by id '${metadata.id}'`);
      }

      if (
        (await this.listeners.beforeNodeUpdate?.(
          definition.nodes[nodeIndex],
          nextNodeMetadata,
          definition,
        )) === 'handled'
      ) {
        return;
      }

      definition.nodes.splice(nodeIndex, 1, nextNodeMetadata);
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

      (prevMetadata as NodeMetadata).nexts!.push(...node.nexts);
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

      movingNode.nexts = [];

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

        prevTrunk.nexts.splice(movingNodeIndex, 1, ...movingNodeNexts);
      }

      targetTrunk.nexts = targetTrunk.nexts || [];

      if (targetNext) {
        if (targetNext.type === 'leaf') {
          let targetNextLeafIndex = targetTrunk.leaves?.findIndex(
            next => next.id === targetNext.id,
          );

          if (targetNextLeafIndex === undefined || targetNextLeafIndex === -1) {
            throw Error(
              `Not found targetNext ${JSON.stringify(
                targetNext,
              )} at leaves of targetNode '${targetTrunk.id}'`,
            );
          }

          let [leaf] = targetTrunk.leaves!.splice(targetNextLeafIndex, 1);

          movingNode.leaves = movingNode.leaves || [];
          movingNode.leaves.push(leaf);
        } else {
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

      if (targetNext.type === 'leaf') {
        let leafIndex = targetTrunk.leaves?.findIndex(next =>
          isEqual(next, targetNext),
        );

        if (leafIndex === undefined || leafIndex === -1) {
          throw Error(
            `Not found leaf metadata ${JSON.stringify(targetNext)} at node '${
              targetTrunk.id
            }'`,
          );
        }

        let [leaf] = targetTrunk.leaves!.splice(leafIndex, 1);

        duplicateNode.leaves = duplicateNode.leaves || [];

        duplicateNode.leaves.push(leaf);

        targetTrunk.nexts.push({
          type: 'node',
          id: duplicateNodeId,
        });
      } else {
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
      }

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
    handler: (definition: ProcedureDefinition) => Promise<void> | void,
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

  private setDefinition(definition: ProcedureDefinition, notify = true): void {
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

function requireTrunks<TTrunkRef extends TrunkRef>(
  definition: ProcedureDefinition,
  trunkRef: TTrunkRef[],
): {node: NodeMetadata; joint: JointMetadata}[TTrunkRef['type']][] {
  let trunksMap = new Map(
    [...definition.nodes, ...definition.joints].map(trunk => [trunk.id, trunk]),
  );

  let trunks: {
    node: NodeMetadata;
    joint: JointMetadata;
  }[TTrunkRef['type']][] = [];

  for (let ref of trunkRef) {
    if (!trunksMap.has(ref.id)) {
      throw Error(`Not found ${ref.type} metadata by id '${ref.id}'`);
    }

    trunks.push(
      trunksMap.get(ref.id)! as {
        node: NodeMetadata;
        joint: JointMetadata;
      }[TTrunkRef['type']],
    );
  }

  return trunks;
}
