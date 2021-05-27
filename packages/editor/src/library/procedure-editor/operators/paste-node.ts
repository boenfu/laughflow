import {FlowId, NodeId} from '@magicflow/procedure';
import {
  Operator,
  OperatorFunction,
  addNode,
  addNodeNexts,
  compose,
  out,
} from '@magicflow/procedure/operators';
import {copyNode} from '@magicflow/procedure/utils';

import {insertNodeAsFlowStart} from './@insert-node-as-flow-start';
import {insertNodeBeforeNexts} from './@insert-node-before-nexts';
import {insertNodeBetweenNodes} from './@insert-node-between-nodes';
import {stripNode} from './@strip-node';

export interface PasteNodeOperatorParam {
  from: NodeId;
  to?: NodeId;
  activeInfo: any;
}

const getPasteNode: OperatorFunction<[any, (value: NodeId) => Operator]> = (
  {value, state},
  callback,
) => {
  if (value.type !== 'singleNode' || state === 'connect') {
    return compose([]);
  }

  let nodeId = value.id;

  if (state === 'cut') {
    return compose([
      stripNode({prev: value.prev, node: value.id}),
      callback(nodeId),
    ]);
  }

  return out(
    definition => addNode(copyNode(value.definition))(definition),
    node => callback(node.id),
  );
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
      activeInfo: any;
      flow: FlowId;
      originStart?: NodeId;
    },
  ]
> = ({flow, activeInfo, originStart}) =>
  getPasteNode(activeInfo, insertNodeAsFlowStart({flow, originStart}));
