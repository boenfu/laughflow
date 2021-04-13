import {FlowId, NodeId} from '@magicflow/core';
import {ProcedureUtil} from '@magicflow/procedure';
import {
  Operator,
  OperatorFunction,
  addNode,
  addNodeNexts,
  compose,
  out,
  removeFlowStart,
  removeNodeNext,
} from '@magicflow/procedure/operators';
import {copyNode} from '@magicflow/procedure/utils';

import {ActiveIdentity} from '../procedure-editor';

import {insertNodeAsFlowStart} from './@insert-node-as-flow-start';
import {insertNodeBeforeNexts} from './@insert-node-before-nexts';
import {insertNodeBetweenNodes} from './@insert-node-between-nodes';

export interface PasteNodeOperatorParam {
  from: NodeId;
  to?: NodeId;
  activeIdentity: ActiveIdentity;
}

const getPasteNode: OperatorFunction<
  [ActiveIdentity, (value: NodeId) => Operator]
> = ({type, id, origin, state}, callback) => {
  let operators: Operator[] = [];

  if (type !== 'singleNode' || state === 'connect') {
    return compose([]);
  }

  let nodeId = id as NodeId;

  if (state === 'cut') {
    operators.push(
      origin
        ? removeNodeNext(origin as NodeId, nodeId)
        : removeFlowStart(origin as FlowId, nodeId),
    );
  } else {
    operators.push(
      out(
        definition =>
          addNode(
            copyNode(ProcedureUtil.requireNode(definition, nodeId, type)),
          )(definition),
        node => {
          nodeId = node.id;
        },
      ),
    );
  }

  operators.push(callback(nodeId));

  return compose(operators);
};

/**
 * 在节点之后粘贴节点
 * @param param0
 * @returns
 */
export const pasteNode: OperatorFunction<[PasteNodeOperatorParam]> = ({
  from,
  activeIdentity,
}) => getPasteNode(activeIdentity, node => addNodeNexts(from, [node]));

/**
 * 在两个节点间粘贴节点
 * @param param0
 * @returns
 */
export const pasteNodeBetweenNodes: OperatorFunction<
  [Required<PasteNodeOperatorParam>]
> = ({from, to, activeIdentity}) =>
  getPasteNode(activeIdentity, insertNodeBetweenNodes({from, to}));

/**
 * 在节点之后粘贴节点并迁移 nexts
 * @param param0
 * @returns
 */
export const pasteNodeBeforeNexts: OperatorFunction<
  [PasteNodeOperatorParam]
> = ({from, activeIdentity}) =>
  getPasteNode(activeIdentity, insertNodeBeforeNexts(from));

/**
 * 粘贴节点并作为 flow start
 * @param param0
 * @returns
 */
export const pasteNodeAsFlowStart: OperatorFunction<
  [
    {
      activeIdentity: ActiveIdentity;
      flow: FlowId;
      originStart?: NodeId;
    },
  ]
> = ({flow, activeIdentity, originStart}) =>
  getPasteNode(activeIdentity, insertNodeAsFlowStart({flow, originStart}));
