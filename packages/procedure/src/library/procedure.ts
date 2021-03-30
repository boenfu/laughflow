import {
  BranchesNode,
  Flow,
  FlowId,
  Leaf,
  LeafId,
  LeafType,
  Node,
  NodeId,
  NodeType,
  Procedure as ProcedureDefinition,
  Ref,
} from '@magicflow/core';
import getOrCreate from 'get-or-create';
import {Patch, applyPatches, enableAllPlugins, produce} from 'immer';
import {cloneDeep, compact, isEqual} from 'lodash-es';
import {nanoid} from 'nanoid';

enableAllPlugins();

type ProcedureBeforeListenerReturnType =
  | void
  | 'handled'
  | Promise<void | 'handled'>;

export interface ProcedureListeners {
  afterDefinitionChange?(definition: ProcedureDefinition): void;

  beforeLeafCreate?(
    leaf: Leaf,
    node: Node | BranchesNode,
    definition: ProcedureDefinition,
  ): ProcedureBeforeListenerReturnType;

  beforeLeafDelete?(
    leaf: Leaf,
    node: Node | BranchesNode,
    definition: ProcedureDefinition,
  ): ProcedureBeforeListenerReturnType;

  beforeNodeUpdate?<TNode extends Node | BranchesNode>(
    currentNode: TNode,
    nextNode: TNode,
    definition: ProcedureDefinition,
  ): ProcedureBeforeListenerReturnType;
}

export interface IProcedure {
  definition: ProcedureDefinition;
  listeners: ProcedureListeners;

  createLeaf(target: NodeId, type: LeafType): void;
  updateLeaf(target: NodeId, leaf: Leaf): void;
  deleteLeaf(target: NodeId, leafId: LeafId): void;

  createNode(target: NodeId, position: Ref | 'next' | undefined): void;
  createBranchesNode(target: NodeId, position: Ref | 'next' | undefined): void;

  createFlow(branchesNode: NodeId): void;
  branchFlow(flow: FlowId, nodeId?: NodeId): void;
  updateFlow(flow: Flow): void;
  deleteFlow(branchesNode: NodeId, flow: FlowId): void;

  connectNode(from: NodeId, to: NodeId): void;
  disconnectNode(from: NodeId, to: NodeId): void;

  updateNode(node: Node | BranchesNode): void;

  deleteNode(node: NodeId, prevNode: NodeId | undefined): void;
  moveNode(
    node: NodeId,
    prev: NodeId | undefined,
    target: NodeId,
    targetNext: Ref | undefined,
  ): void;
  copyNode(node: NodeId, target: NodeId, targetNext: Ref | undefined): void;

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

  async createLeaf(nodeId: NodeId, type: LeafType): Promise<void> {
    return this.update(async definition => {
      let node = requireNode(definition, nodeId);

      let id = createId<LeafId>();
      let metadata = {
        id,
        type,
      };

      if (
        (await this.listeners.beforeLeafCreate?.(
          metadata,
          node,
          definition,
        )) === 'handled'
      ) {
        return;
      }

      getOrCreate(node).property('leaves', []).exec().push(metadata);
    });
  }

  async updateLeaf(nodeId: NodeId, metadata: Leaf): Promise<void> {
    return this.update(definition => {
      let node = requireNode(definition, nodeId);

      let leafIndex = node.leaves?.findIndex(({id}) => id === metadata.id);

      if (leafIndex === undefined || leafIndex === -1) {
        throw Error(`Not found leaf definition by id '${metadata.id}'`);
      }

      node.leaves!.splice(leafIndex, 1, metadata);
    });
  }

  async deleteLeaf(nodeId: NodeId, leafId: LeafId): Promise<void> {
    return this.update(async definition => {
      let node = requireNode(definition, nodeId);

      let leafIndex = node.leaves?.findIndex(leaf => leaf.id === leafId);

      if (leafIndex === undefined || leafIndex === -1) {
        throw Error(`Not found leaf definition by leaf '${leafId}'`);
      }

      let leaf = node.leaves![leafIndex];

      if (
        (await this.listeners.beforeLeafDelete?.(leaf, node, definition)) ===
        'handled'
      ) {
        return;
      }

      node.leaves!.splice(leafIndex, 1);
    });
  }

  /**
   *
   * @param target
   * @param position
   *  1. position = undefined, 创建节点 node 的新子节点分支
   *  2. position = 'next', 创建新节点并转移节点 node 所有子节点到新节点
   *  3. position = NextMetadata, 创建新节点插入至节点 node 与 next 之间
   */
  async createNode(
    targetId: NodeId,
    position: Ref | 'next' | undefined,
    partialNode: Partial<Node> = {},
  ): Promise<void> {
    return this._createNode('node', targetId, position, partialNode);
  }

  /**
   *
   * @param target
   * @param position
   *  1. position = undefined, 创建节点 node 的新子节点分支
   *  2. position = 'next', 创建新节点并转移节点 node 所有子节点到新节点
   *  3. position = NextMetadata, 创建新节点插入至节点 node 与 next 之间
   */
  async createBranchesNode(
    targetId: NodeId,
    position: Ref | 'next' | undefined,
    partialNode: Partial<BranchesNode> = {},
  ): Promise<void> {
    return this._createNode('branchesNode', targetId, position, partialNode);
  }

  async createFlow(branchesNodeId: NodeId): Promise<void> {
    return this.update(async definition => {
      let branchesNode = requireNode(
        definition,
        branchesNodeId,
        'branchesNode',
      );

      let id = createId<FlowId>();

      let flow: Flow = {
        id,
        nodes: [],
      };

      // TODO: before create flow

      getOrCreate(definition).property('flows', []).exec().push(flow);
      getOrCreate(branchesNode).property('flows', []).exec().push(id);
    });
  }

  async branchFlow(flowId: FlowId, nodeId?: NodeId): Promise<void> {
    return this.update(async definition => {
      let flow = requireFlow(definition, flowId);

      let nextNodeMetadata!: Node | BranchesNode;

      if (nodeId) {
        nextNodeMetadata = requireNode(definition, nodeId);
      } else {
        nextNodeMetadata = {
          type: 'node',
          id: createId(),
          nexts: [],
          leaves: undefined,
        };
      }

      getOrCreate(definition)
        .property('nodes', [])
        .exec()
        .push(nextNodeMetadata);
      getOrCreate(flow).property('nodes', []).exec().push(nextNodeMetadata.id);
    });
  }

  async updateFlow(flow: Flow): Promise<void> {
    return this.update(definition => {
      let flowIndex = definition.flows?.findIndex(({id}) => id === flow.id);

      if (flowIndex === undefined || flowIndex === -1) {
        throw Error(`Not found flow definition by id '${flow.id}'`);
      }

      definition.flows.splice(flowIndex, 1, flow);
    });
  }

  async deleteFlow(branchesNodeId: NodeId, flowId: FlowId): Promise<void> {
    return this.update(definition => {
      let branchesNode = requireNode(
        definition,
        branchesNodeId,
        'branchesNode',
      );

      let flowIndex = branchesNode.flows.findIndex(flow => flow === flowId);

      if (flowIndex === -1) {
        throw Error(
          `Not found flow '${flowId}' in branchesNode '${branchesNodeId}'`,
        );
      }

      let flowDefinitionIndex = definition.flows.findIndex(
        ({id}) => id === flowId,
      );

      if (flowIndex === -1) {
        throw Error(`Not found flow definition by id '${flowId}'`);
      }

      branchesNode.flows.splice(flowIndex, 1);
      definition.flows.splice(flowDefinitionIndex, 1);
    });
  }

  async connectNode(fromId: NodeId, toId: NodeId): Promise<void> {
    return this.update(definition => {
      let from = requireNode(definition, fromId);
      let to = requireNode(definition, toId);

      getOrCreate(from).property('nexts', []).exec().push(to.id);
    });
  }

  async disconnectNode(fromId: NodeId, toId: NodeId): Promise<void> {
    return this.update(definition => {
      let from = requireNode(definition, fromId);
      let fromNexts = getOrCreate(from).property('nexts', []).exec();

      fromNexts = fromNexts.filter(next => next !== toId);
    });
  }

  async updateNode(node: Node | BranchesNode): Promise<void> {
    let nextNodeMetadata = cloneDeep(node);

    return this.update(async definition => {
      let nodeIndex = definition.nodes.findIndex(({id}) => id === node.id);

      if (nodeIndex === -1) {
        throw Error(`Not found node definition by id '${node.id}'`);
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

  async deleteNode(
    nodeId: NodeId,
    prevNodeId: NodeId | undefined,
  ): Promise<void> {
    return this.update(definition => {
      let nodesMap = new Map(definition.nodes.map(node => [node.id, node]));

      let node = nodesMap.get(nodeId);

      if (!node) {
        throw Error(`Not found node definition by id '${nodeId}'`);
      }

      let prevMetadata = prevNodeId ? nodesMap.get(prevNodeId) : undefined;

      if (prevNodeId) {
        if (!prevMetadata) {
          throw Error(`Not found node definition by id '${prevNodeId}'`);
        }

        if (!prevMetadata.nexts?.some(next => next === nodeId)) {
          throw Error(
            `Not found node '${nodeId}' at nexts of prevNode '${prevNodeId}'`,
          );
        }
      }

      let visitedNodesSet: Set<NodeId> = new Set();

      let checkingNodes = [...getOrCreate(node).property('nexts', []).exec()];

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

        checkingNodes.push(
          ...getOrCreate(checkingNode).property('nexts', []).exec(),
        );
      }

      definition.nodes = compact(
        definition.nodes.map(node => {
          if (node.id === nodeId) {
            return undefined;
          }

          node.nexts = node.nexts?.filter(next => next !== nodeId);

          return node;
        }),
      );

      if (!prevMetadata || !node.nexts?.length) {
        return;
      }

      prevMetadata.nexts!.push(...node.nexts);
    });
  }

  async moveNode(
    movingNodeId: NodeId,
    prev: NodeId | undefined,
    target: NodeId,
    targetNext: Ref | undefined,
  ): Promise<void> {
    if (movingNodeId === target) {
      return;
    }

    return this.update(definition => {
      let movingNode = requireNode(definition, movingNodeId);
      let targetNode = requireNode(definition, target);

      let movingNodeNexts = getOrCreate(movingNode)
        .property('nexts', [])
        .exec();

      movingNode.nexts = [];

      if (prev) {
        let prevNode = requireNode(definition, prev);

        let prevNodeNexts = getOrCreate(prevNode).property('nexts', []).exec();

        let movingNodeIndex = prevNodeNexts.findIndex(
          next => next === movingNodeId,
        );

        if (movingNodeIndex === -1) {
          throw Error(
            `Not found movingNode '${movingNodeId}' at nexts of prevNode '${prev}'`,
          );
        }

        prevNodeNexts.splice(movingNodeIndex, 1, ...movingNodeNexts);
      }

      let targetNodeNexts = getOrCreate(targetNode).property('nexts').exec();

      if (targetNext) {
        if (targetNext.type === 'leaf') {
          let targetNextLeafIndex = targetNode.leaves?.findIndex(
            next => next.id === targetNext.id,
          );

          if (targetNextLeafIndex === undefined || targetNextLeafIndex === -1) {
            throw Error(
              `Not found targetNext ${JSON.stringify(
                targetNext,
              )} at leaves of targetNode '${targetNode.id}'`,
            );
          }

          let [leaf] = targetNode.leaves!.splice(targetNextLeafIndex, 1);

          getOrCreate(movingNode).property('leaves', []).exec().push(leaf);
        } else {
          let targetNextIndex = targetNodeNexts.findIndex(
            next => next === targetNext.id,
          );

          if (targetNextIndex === -1) {
            throw Error(
              `Not found targetNext ${JSON.stringify(
                targetNext,
              )} at nexts of targetNode '${targetNode.id}'`,
            );
          }

          targetNodeNexts.splice(targetNextIndex, 1);

          movingNode.nexts.push(targetNext.id);
        }
      }

      targetNodeNexts.push(movingNodeId);
    });
  }

  async copyNode(
    copyingNodeId: NodeId,
    target: NodeId,
    targetNext: Ref | undefined,
  ): Promise<void> {
    return this.update(definition => {
      let copyingNode = requireNode(definition, copyingNodeId);
      let targetNode = requireNode(definition, target);

      let duplicateNodeId = createId<NodeId>();
      let duplicateNode = cloneDeep(copyingNode);

      duplicateNode.id = duplicateNodeId;
      duplicateNode.nexts = [];

      let targetNodeNexts = getOrCreate(targetNode)
        .property('nexts', [])
        .exec();

      if (!targetNext) {
        targetNodeNexts.push(duplicateNodeId);
        definition.nodes.push(duplicateNode);

        return;
      }

      if (targetNext.type === 'leaf') {
        let leafIndex = targetNode.leaves?.findIndex(next =>
          isEqual(next, targetNext),
        );

        if (leafIndex === undefined || leafIndex === -1) {
          throw Error(
            `Not found leaf metadata ${JSON.stringify(targetNext)} at node '${
              targetNode.id
            }'`,
          );
        }

        let [leaf] = targetNode.leaves!.splice(leafIndex, 1);

        getOrCreate(duplicateNode).property('leaves', []).exec().push(leaf);

        targetNodeNexts.push(duplicateNodeId);
      } else {
        let nextIndex = targetNodeNexts.findIndex(next =>
          isEqual(next, targetNext),
        );

        if (nextIndex === -1) {
          throw Error(
            `Not found next metadata ${JSON.stringify(targetNext)} at node '${
              targetNode.id
            }'`,
          );
        }

        targetNodeNexts.splice(nextIndex, 1, duplicateNodeId);

        duplicateNode.nexts.push(targetNext.id);
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

    if (isEqual(definition, this._definition)) {
      return;
    }

    this.setDefinition(definition);
  }

  private async _createNode<TNode extends Node | BranchesNode>(
    type: TNode['type'],
    targetId: NodeId,
    position: Ref | 'next' | undefined,
    {id: _id, nexts = [], leaves = undefined, ...partial}: Partial<TNode> = {},
  ): Promise<void> {
    return this.update(definition => {
      let targetNode = requireNode(definition, targetId);

      let id = createId<NodeId>();

      let newNode =
        type === 'node'
          ? ({...partial, type, id, nexts, leaves} as Node)
          : ({...partial, type, id, nexts, leaves, flows: []} as BranchesNode);

      if (typeof position === 'object') {
        let nextIndex = targetNode.nexts?.findIndex(item =>
          isEqual(item, position),
        );

        if (nextIndex === undefined || nextIndex === -1) {
          throw Error(`Not found node next by ${JSON.stringify(position)}`);
        }

        newNode.nexts!.push(targetNode.nexts![nextIndex]);
        targetNode.nexts!.splice(nextIndex, 1, id);
      } else {
        if (
          position === 'next' &&
          targetNode.nexts &&
          targetNode.nexts.length
        ) {
          newNode.nexts!.push(...targetNode.nexts);
          targetNode.nexts = [];
        }

        getOrCreate(targetNode).property('nexts', []).exec().push(id);
      }

      definition.nodes.push(newNode);
    });
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

function requireNode<TNodeType extends NodeType>(
  definition: ProcedureDefinition,
  nodeId: NodeId,
  type?: TNodeType,
): TNodeType extends NodeType
  ? Extract<Node | BranchesNode, {type: TNodeType}>
  : Node | BranchesNode {
  let node = definition.nodes.find(node => node.id === nodeId);

  if (!node) {
    throw Error(`Not found node definition by id '${nodeId}'`);
  }

  if (type && node.type !== type) {
    throw Error(`Not found ${type} definition by id '${nodeId}'`);
  }

  return node as any;
}

function requireFlow(definition: ProcedureDefinition, flowId: FlowId): Flow {
  let flow = definition.flows.find(flow => flow.id === flowId);

  if (!flow) {
    throw Error(`Not found flow definition by id '${flowId}'`);
  }

  return flow;
}
