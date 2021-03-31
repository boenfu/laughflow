import {
  BranchesNode,
  Flow,
  FlowId,
  INode,
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
import {enableAllPlugins, produce} from 'immer';
import {cloneDeep, compact, isEqual} from 'lodash-es';
import {nanoid} from 'nanoid';

import {Stack} from './@stack';

enableAllPlugins();

export interface ProcedureListeners {
  afterDefinitionChange?(definition: ProcedureDefinition): void;
}

export interface IProcedure {
  definition: ProcedureDefinition;
  listeners: ProcedureListeners;

  createFlow(branchesNode: NodeId): void;
  updateFlow(flow: Flow): void;
  deleteFlow(branchesNode: NodeId, flow: FlowId): void;

  addFlowStart(flow: FlowId, node: NodeId): void;
  removeFlowStart(flow: FlowId, node: NodeId): void;
  removeAllFlowStart(flow: FlowId, node: NodeId): void;

  createNode(source: NodeId): void;
  createNodeBetweenNode(source: NodeId, next: NodeId): void;
  createNodeBeforeLeaf(source: NodeId, leaf: LeafId): void;
  createNodeInheritNexts(source: NodeId): void;
  createNodeInheritNextsAndLeaves(source: NodeId): void;
  createNodeAsFlowStart(source: FlowId): void;

  createBranchesNode(source: NodeId): void;
  createBranchesNodeBetweenNode(source: NodeId, next: NodeId): void;
  createBranchesNodeBeforeLeaf(source: NodeId, leaf: LeafId): void;
  createBranchesNodeInheritNexts(source: NodeId): void;
  createBranchesNodeInheritNextsAndLeaves(source: NodeId): void;
  createBranchesNodeAsFlowStart(source: FlowId): void;

  updateNode(node: Node): void;
  updateBranchesNode(node: BranchesNode): void;

  deleteNode(node: NodeId): void;
  deleteNodeOfferNexts(node: NodeId, receivedNode: NodeId): void;
  deleteBranchesNode(node: NodeId): void;
  deleteBranchesNodeOfferNexts(node: NodeId, receivedNode: NodeId): void;

  linkNode(from: NodeId, to: NodeId): void;
  unlinkNode(from: NodeId, to: NodeId): void;

  moveNode(
    node: NodeId,
    prevNode: NodeId | undefined,
    target: NodeId,
    targetNext?: Ref,
  ): void;

  moveNodeToBeforeLeaf(
    node: NodeId,
    prevNode: NodeId | undefined,
    target: NodeId,
    targetNext?: Ref,
  ): void;

  moveNodeAsFlowStart(
    node: NodeId,
    prevNode: NodeId | undefined,
    flow: FlowId,
    beforeFlowStart?: NodeId,
  ): void;

  moveFlowStartBetweenFlow(
    from: FlowId,
    node: NodeId,
    to: FlowId,
    /**
     * 有 beforeFlowStart 的情况下，from 不能是多次使用的节点
     */
    beforeFlowStart?: NodeId,
  ): void;

  moveFlowStartToNode(
    flow: FlowId,
    node: NodeId,
    target: NodeId,
    targetNext?: Ref,
  ): void;

  copyNode(node: NodeId, target: NodeId, targetNext: Ref | undefined): void;

  createLeaf(node: NodeId, type: LeafType): void;
  updateLeaf(node: NodeId, leaf: Leaf): void;
  deleteLeaf(node: NodeId, leafId: LeafId): void;

  undo(): void;
  redo(): void;

  /**
   * 清理所有未使用的内容
   */
  purge(): void;
}

export class Procedure implements IProcedure {
  private _definition!: ProcedureDefinition;

  get definition(): ProcedureDefinition {
    return this._definition;
  }

  constructor(
    definition: ProcedureDefinition,
    readonly listeners: ProcedureListeners = {},
    private readonly stack = new Stack(),
  ) {
    this.setDefinition(cloneDeep(definition), false);
  }

  createFlow(branchesNodeId: NodeId): void {
    this.update(definition => {
      let branchesNode = requireNode(
        definition,
        branchesNodeId,
        'branchesNode',
      );

      let flow: Flow = {
        id: createId(),
        nodes: [],
      };

      getOrCreate(definition).property('flows', []).exec().push(flow);
      getOrCreate(branchesNode).property('flows', []).exec().push(flow.id);
    });
  }

  updateFlow(flow: Flow): void {
    this.update(definition => {
      let flowIndex = definition.flows.findIndex(({id}) => id === flow.id);

      if (flowIndex === -1) {
        throw Error(`Not found flow definition by id '${flow.id}'`);
      }

      definition.flows.splice(flowIndex, 1, flow);
    });
  }

  deleteFlow(branchesNodeId: NodeId, flowId: FlowId): void {
    this.update(definition => {
      if (flowId === definition.start) {
        // can not delete start flow
        return;
      }

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

  /**
   *
   * @param target
   * @param position
   *  1. position = undefined, 创建节点 node 的新子节点分支
   *  2. position = 'next', 创建新节点并转移节点 node 所有子节点到新节点
   *  3. position = NextMetadata, 创建新节点插入至节点 node 与 next 之间
   */
  createNode(
    from: NodeId,
    position: Ref | 'next' | undefined,
    partialNode: Partial<Node> = {},
  ): void {
    return this._createNode('node', from, position, partialNode);
  }

  /**
   *
   * @param target
   * @param position
   *  1. position = undefined, 创建节点 node 的新子节点分支
   *  2. position = 'next', 创建新节点并转移节点 node 所有子节点到新节点
   *  3. position = NextMetadata, 创建新节点插入至节点 node 与 next 之间
   */
  createBranchesNode(
    from: NodeId,
    position: Ref | 'next' | undefined,
    partialNode: Partial<BranchesNode> = {},
  ): void {
    return this._createNode('branchesNode', from, position, partialNode);
  }

  createNodeAsFlowStart(target: FlowId, type: NodeType = 'node'): void {
    this.update(definition => {
      let flow = requireFlow(definition, target);
      let node = createNode(type);

      definition.nodes.push(node);
      flow.nodes.push(node.id);
    });
  }

  addFlowStart(flow: FlowId, node: NodeId): void {
    this.update(definition => {
      requireNode(definition, node);
      requireFlow(definition, flow).nodes.push(node);
    });
  }

  deleteFlowStart(flowId: FlowId, node: NodeId, deleteAll): void {
    this.update(definition => {
      let flow = requireFlow(definition, flowId);

      let nodeIndex = flow;

      flow.nodes = flow.nodes.filter(id => id !== node);
    });
  }

  linkNode(fromNode: NodeId, toNode: NodeId): void {
    this.update(definition => {
      getOrCreate(requireNode(definition, fromNode))
        .property('nexts', [])
        .exec()
        .push(requireNode(definition, toNode).id);
    });
  }

  unlinkNode(fromNode: NodeId, toNode: NodeId): void {
    this.update(definition => {
      let fromNexts = getOrCreate(requireNode(definition, fromNode))
        .property('nexts', [])
        .exec();

      fromNexts = fromNexts.filter(next => next !== toNode);
    });
  }

  updateNode(node: Node | BranchesNode): void {
    let nextNodeMetadata = cloneDeep(node);

    this.update(definition => {
      let nodeIndex = definition.nodes.findIndex(({id}) => id === node.id);

      if (nodeIndex === -1) {
        throw Error(`Not found node definition by id '${node.id}'`);
      }

      definition.nodes.splice(nodeIndex, 1, nextNodeMetadata);
    });
  }

  deleteNode(nodeId: NodeId, prevNodeId: NodeId | undefined): void {
    this.update(definition => {
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

        let checkingNode = nodesMap.get(checkingNodeId);

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

      prevMetadata.nexts.push(...node.nexts);
    });
  }

  moveNode(
    nodeId: NodeId,
    prevNodeId: NodeId | undefined,
    target: NodeId,
    targetNext?: Ref,
  ): void {
    if (nodeId === target) {
      return;
    }

    this.update(definition => {
      let movingNode = requireNode(definition, nodeId);
      let targetNode = requireNode(definition, target);

      if (prevNodeId) {
        stripNode(definition, movingNode, prevNodeId);
      }

      let targetNodeNexts = getOrCreate(targetNode).property('nexts').exec();

      if (targetNext) {
        if (targetNext.type === 'leaf') {
          if (!targetNode.leaves) {
            throw Error(
              `Not found targetNext ${JSON.stringify(
                targetNext,
              )} at leaves of targetNode '${targetNode.id}'`,
            );
          }

          let targetNextLeafIndex = targetNode.leaves.findIndex(
            next => next.id === targetNext.id,
          );

          if (targetNextLeafIndex === -1) {
            throw Error(
              `Not found targetNext ${JSON.stringify(
                targetNext,
              )} at leaves of targetNode '${targetNode.id}'`,
            );
          }

          let [leaf] = targetNode.leaves.splice(targetNextLeafIndex, 1);

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

      targetNodeNexts.push(nodeId);
    });
  }

  moveNodeAsFlowStart(
    nodeId: NodeId,
    prevNodeId: NodeId | undefined,
    flowId: FlowId,
    beforeFlowStart?: NodeId,
  ): void {
    this.update(definition => {
      let flow = requireFlow(definition, flowId);

      let node = requireNode(definition, nodeId);

      if (prevNodeId) {
        stripNode(definition, node, prevNodeId);
      }

      if (!beforeFlowStart) {
        flow.nodes.push(nodeId);
        return;
      }

      let flowStartIndex = flow.nodes.findIndex(
        node => node === beforeFlowStart,
      );

      if (flowStartIndex === -1) {
        throw Error(`Not found flow start by id '${beforeFlowStart}'`);
      }

      flow.nodes.splice(flowStartIndex, 1, nodeId);
      node.nexts.push(beforeFlowStart);
    });
  }

  moveFlowStartBetweenFlow(
    from: FlowId,
    nodeId: NodeId,
    to: FlowId,
    beforeFlowStart?: NodeId,
  ): void {
    if (from === to) {
      return;
    }

    this.update(definition => {
      let toFlow = requireFlow(definition, to);

      if (
        beforeFlowStart &&
        toFlow.nodes.every(node => node !== beforeFlowStart)
      ) {
        return;
      }

      let fromFlow = requireFlow(definition, from);

      // fromFlow.nodes

      let node = requireNode(definition, nodeId);
    });
  }

  moveFlowStartToNode(
    flow: FlowId,
    node: NodeId,
    target: NodeId,
    targetNext?: Ref,
  ): void {}

  moveNode2(
    nodeOrBranchesNode: NodeId,
    prev: NodeId | undefined,
    target: NodeId,
    targetNext: Ref | undefined,
  ): void {
    if (nodeOrBranchesNode === target) {
      return;
    }

    this.update(definition => {
      let movingNode = requireNode(definition, nodeOrBranchesNode);
      let targetNode = requireNode(definition, target);

      let movingNodeNexts = [...movingNode.nexts];
      movingNode.nexts = [];

      if (prev) {
        let prevNode = requireNode(definition, prev);

        let prevNodeNexts = getOrCreate(prevNode).property('nexts', []).exec();

        let movingNodeIndex = prevNodeNexts.findIndex(
          next => next === nodeOrBranchesNode,
        );

        if (movingNodeIndex === -1) {
          throw Error(
            `Not found movingNode '${nodeOrBranchesNode}' at nexts of prevNode '${prev}'`,
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

      targetNodeNexts.push(nodeOrBranchesNode);
    });
  }

  copyNode(
    copyingNodeId: NodeId,
    target: NodeId,
    targetNext: Ref | undefined,
  ): void {
    this.update(definition => {
      let copyingNode = requireNode(definition, copyingNodeId, 'node');
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

  update(handler: (definition: ProcedureDefinition) => void): void {
    let definition = produce(
      this._definition,
      handler,
      (patches, inversePatches) => {
        if (!patches.length) {
          return;
        }

        console.log(patches, inversePatches);

        this.stack.update(patches, inversePatches);
      },
    );

    if (isEqual(definition, this._definition)) {
      return;
    }

    this.setDefinition(definition);
  }

  createLeaf(nodeId: NodeId, type: LeafType): void {
    this.update(definition => {
      let metadata: Leaf = {
        id: createId(),
        type,
      };

      getOrCreate(requireNode(definition, nodeId))
        .property('leaves', [])
        .exec()
        .push(metadata);
    });
  }

  updateLeaf(nodeId: NodeId, leaf: Leaf): void {
    this.update(definition => {
      let node = requireNode(definition, nodeId);

      if (!node.leaves) {
        throw Error(`Not found leaf definition by id '${leaf.id}'`);
      }

      let leafIndex = node.leaves.findIndex(({id}) => id === leaf.id);

      if (leafIndex === -1) {
        throw Error(`Not found leaf definition by id '${leaf.id}'`);
      }

      node.leaves.splice(leafIndex, 1, leaf);
    });
  }

  deleteLeaf(nodeId: NodeId, leafId: LeafId): void {
    this.update(definition => {
      let node = requireNode(definition, nodeId);

      node.leaves = node.leaves?.filter(leaf => leaf.id === leafId);
    });
  }

  undo(): void {
    let definition = this.stack.undo(this._definition);

    if (!definition) {
      return;
    }

    this.setDefinition(definition);
  }

  redo(): void {
    let definition = this.stack.redo(this._definition);

    if (!definition) {
      return;
    }

    this.setDefinition(definition);
  }

  private _createNode<TNode extends Node | BranchesNode>(
    type: TNode['type'],
    fromId: NodeId,
    position: Ref | 'next' | undefined,
    partialNode: Partial<TNode> = {},
  ): void {
    this.update(definition => {
      let fromNode = requireNode(definition, fromId);

      let newNode = createNode(type, partialNode);

      if (typeof position === 'object') {
        if (position.type === 'leaf') {
          if (!fromNode.leaves) {
            throw Error(`Not found leaf by ${JSON.stringify(position)}`);
          }

          let leafIndex = fromNode.leaves.findIndex(
            leaf => leaf.id === position.id,
          );

          if (leafIndex === -1) {
            throw Error(`Not found leaf by ${JSON.stringify(position)}`);
          }

          let [leaf] = fromNode.leaves.splice(leafIndex, 1);
          fromNode.nexts.push(newNode.id);

          getOrCreate<Node | BranchesNode>(newNode)
            .property('leaves', [])
            .exec()
            .push(leaf);
        } else {
          let nextIndex = fromNode.nexts.findIndex(id => id === position.id);

          if (nextIndex === -1) {
            throw Error(`Not found node next by ${JSON.stringify(position)}`);
          }

          newNode.nexts.push(fromNode.nexts[nextIndex]);
          fromNode.nexts.splice(nextIndex, 1, newNode.id);
        }
      } else {
        if (position === 'next') {
          newNode.nexts.push(...fromNode.nexts);
          fromNode.nexts = [];
        }

        fromNode.nexts.push(newNode.id);
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

  static createEmptyProcedure(): ProcedureDefinition {
    let flow: Flow = {id: createId(), nodes: []};

    return {
      id: createId(),
      start: flow.id,
      flows: [flow],
      nodes: [],
    };
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

function createNode<TNode extends Node | BranchesNode>(
  type: TNode['type'],
  {id: _id, nexts = [], ...partial}: Partial<TNode> = {},
): TNode {
  let generalNode: INode = {
    id: createId(),
    type,
    nexts,
  };

  return (type === 'node'
    ? ({...partial, ...generalNode} as Node)
    : ({flows: [], ...partial, ...generalNode} as BranchesNode)) as any;
}

/**
 * 将 node 与其 nexts 进行剥离后，将 nexts 填充到前一个节点
 * @param definition
 * @param node
 * @param prevNodeId
 */
function stripNode(
  definition: ProcedureDefinition,
  node: Node | BranchesNode,
  prevNodeId: NodeId,
): void {
  let nodeNexts = [...node.nexts];

  node.nexts = [];

  let prevNode = requireNode(definition, prevNodeId);

  let prevNodeNexts = getOrCreate(prevNode).property('nexts', []).exec();

  let nodeIndex = prevNodeNexts.findIndex(next => next === node.id);

  if (nodeIndex === -1) {
    throw Error(
      `Not found movingNode '${node.id}' at nexts of prevNode '${prevNodeId}'`,
    );
  }

  prevNodeNexts.splice(nodeIndex, 1, ...nodeNexts);
}
