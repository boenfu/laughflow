import {FlowId, NodeId, NodeType} from '@magicflow/procedure';
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

import {insertNodeAsFlowStart} from './@insert-node-as-flow-start';
import {insertNodeBeforeNexts} from './@insert-node-before-nexts';
import {insertNodeBetweenNodes} from './@insert-node-between-nodes';
import {createFlow} from './create-flow';

export interface CreateNodeOperatorParam {
  from: NodeId;
  type: NodeType;
  to?: NodeId;
}

const addNode: OperatorFunction<[NodeType, (value: NodeId) => Operator]> = (
  type,
  callback,
) => {
  if (type === 'singleNode') {
    return out(_addNode(createNodeHelper()), node => callback(node.id));
  }

  return out(_addNode(createBranchesNode()), node => [
    createFlow({
      node: node.id,
    }),
    callback(node.id),
  ]);
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

/**
 * 新增节点并作为 flow start
 * @param param0
 * @returns
 */
export const createNodeAsFlowStart: OperatorFunction<
  [
    {
      flow: FlowId;
      type: NodeType;
      originStart?: NodeId | 'all';
    },
  ]
> = ({flow, type, originStart}) =>
  addNode(type, insertNodeAsFlowStart({flow, originStart}));
