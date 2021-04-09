import {Node, NodeId, NodeType} from '@magicflow/core';
import {
  OperatorFunction,
  addNode as _addNode,
  addNodeNexts,
  out,
} from '@magicflow/procedure/operators';
import {
  createBranchesNode,
  createNode as createNodeHelper,
} from '@magicflow/procedure/utils';

import {insertNodeBeforeNexts} from './@insert-node-before-nexts';
import {insertNodeBetweenNodes} from './@insert-node-between-nodes';

export interface CreateNodeOperatorParam {
  from: NodeId;
  type: NodeType;
  to?: NodeId;
}

const addNode: OperatorFunction<[NodeType], [Node]> = type =>
  _addNode(type === 'singleNode' ? createNodeHelper() : createBranchesNode());

/**
 * 在节点之后新增节点
 * @param param0
 * @returns
 */
export const createNode: OperatorFunction<[CreateNodeOperatorParam]> = ({
  from,
  type,
}) => out(addNode(type), ({id}) => addNodeNexts(from, [id]));

/**
 * 在两个节点间新增节点
 * @param param0
 * @returns
 */
export const createNodeBetweenNodes: OperatorFunction<
  [Required<CreateNodeOperatorParam>]
> = ({from, to, type}) =>
  out(addNode(type), ({id}) => insertNodeBetweenNodes({from, to, target: id}));

/**
 * 在节点之后新增节点并迁移 nexts
 * @param param0
 * @returns
 */
export const createNodeBeforeNexts: OperatorFunction<
  [CreateNodeOperatorParam]
> = ({from, type}) =>
  out(addNode(type), ({id}) => insertNodeBeforeNexts({from, to: id}));
