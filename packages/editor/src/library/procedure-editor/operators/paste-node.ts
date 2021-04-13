import {FlowId, NodeId} from '@magicflow/core';
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

import {ActiveInfo} from '../procedure-editor';

import {insertNodeAsFlowStart} from './@insert-node-as-flow-start';
import {insertNodeBeforeNexts} from './@insert-node-before-nexts';
import {insertNodeBetweenNodes} from './@insert-node-between-nodes';

export interface PasteNodeOperatorParam {
  from: NodeId;
  to?: NodeId;
  activeInfo: ActiveInfo;
}

const getPasteNode: OperatorFunction<
  [ActiveInfo, (value: NodeId) => Operator]
> = ({value, state}, callback) => {
  let operators: Operator[] = [];

  if (value.type !== 'singleNode' || state === 'connect') {
    return compose([]);
  }

  let nodeId = value.id;

  if (state === 'cut') {
    operators.push(
      value.prev.type !== 'flow'
        ? removeNodeNext(value.prev.id, nodeId)
        : removeFlowStart(value.prev.id, nodeId),
    );
  } else {
    operators.push(
      out(
        definition => addNode(copyNode(value.definition))(definition),
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
  activeInfo,
}) => getPasteNode(activeInfo, node => addNodeNexts(from, [node]));

/**
 * 在两个节点间粘贴节点
 * @param param0
 * @returns
 */
export const pasteNodeBetweenNodes: OperatorFunction<
  [Required<PasteNodeOperatorParam>]
> = ({from, to, activeInfo}) =>
  getPasteNode(activeInfo, insertNodeBetweenNodes({from, to}));

/**
 * 在节点之后粘贴节点并迁移 nexts
 * @param param0
 * @returns
 */
export const pasteNodeBeforeNexts: OperatorFunction<
  [PasteNodeOperatorParam]
> = ({from, activeInfo}) =>
  getPasteNode(activeInfo, insertNodeBeforeNexts(from));

/**
 * 粘贴节点并作为 flow start
 * @param param0
 * @returns
 */
export const pasteNodeAsFlowStart: OperatorFunction<
  [
    {
      activeInfo: ActiveInfo;
      flow: FlowId;
      originStart?: NodeId;
    },
  ]
> = ({flow, activeInfo, originStart}) =>
  getPasteNode(activeInfo, insertNodeAsFlowStart({flow, originStart}));
