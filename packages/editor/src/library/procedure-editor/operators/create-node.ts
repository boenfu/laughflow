import {NodeId, NodeType} from '@magicflow/core';
import {
  Operator,
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

const addNode: OperatorFunction<[NodeType, (value: NodeId) => Operator]> = (
  type,
  callback,
) => {
  return out(
    _addNode(type === 'singleNode' ? createNodeHelper() : createBranchesNode()),
    node => callback(node.id),
  );
};

/**
 * 在节点之后新增节点
 * @param param0
 * @returns
 */
export const createNode: OperatorFunction<[CreateNodeOperatorParam]> = ({
  from,
  type,
}) => addNode(type, id => addNodeNexts(from, [id]));

/**
 * 在两个节点间新增节点
 * @param param0
 * @returns
 */
export const createNodeBetweenNodes: OperatorFunction<
  [Required<CreateNodeOperatorParam>]
> = ({from, to, type}) => addNode(type, insertNodeBetweenNodes({from, to}));

/**
 * 在节点之后新增节点并迁移 nexts
 * @param param0
 * @returns
 */
export const createNodeBeforeNexts: OperatorFunction<
  [CreateNodeOperatorParam]
> = ({from, type}) => addNode(type, insertNodeBeforeNexts(from));
