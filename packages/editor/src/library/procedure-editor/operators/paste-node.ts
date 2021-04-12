import {FlowId, NodeId} from '@magicflow/core';
import {
  Operator,
  OperatorFunction,
  addNodeNexts,
  compose,
  removeNodeNext,
} from '@magicflow/procedure/operators';

import {Clipboard} from '../@clipboard';

import {insertNodeAsFlowStart} from './@insert-node-as-flow-start';
import {insertNodeBeforeNexts} from './@insert-node-before-nexts';
import {insertNodeBetweenNodes} from './@insert-node-between-nodes';

export interface PasteNodeOperatorParam {
  from: NodeId;
  to?: NodeId;
  clipboard: Clipboard<NodeId, NodeId>;
}

const getPasteNode: OperatorFunction<
  [Clipboard<NodeId, NodeId>, (value: NodeId) => Operator]
> = (clipboard, callback) => {
  let pasteTarget = clipboard.paste();

  if (!pasteTarget) {
    // 没有剪切和复制的对象, 视为空操作
    return compose([]);
  }

  let operators: Operator[] = [];
  let {type, origin, value} = pasteTarget;

  if (type === 'clip' && origin) {
    operators.push(removeNodeNext(origin, value));
  }

  operators.push(callback(value));

  return compose(operators);
};

/**
 * 在节点之后粘贴节点
 * @param param0
 * @returns
 */
export const pasteNode: OperatorFunction<[PasteNodeOperatorParam]> = ({
  from,
  clipboard,
}) => getPasteNode(clipboard, node => addNodeNexts(from, [node]));

/**
 * 在两个节点间粘贴节点
 * @param param0
 * @returns
 */
export const pasteNodeBetweenNodes: OperatorFunction<
  [Required<PasteNodeOperatorParam>]
> = ({from, to, clipboard}) =>
  getPasteNode(clipboard, insertNodeBetweenNodes({from, to}));

/**
 * 在节点之后粘贴节点并迁移 nexts
 * @param param0
 * @returns
 */
export const pasteNodeBeforeNexts: OperatorFunction<
  [PasteNodeOperatorParam]
> = ({from, clipboard}) => getPasteNode(clipboard, insertNodeBeforeNexts(from));

/**
 * 粘贴节点并作为 flow start
 * @param param0
 * @returns
 */
export const pasteNodeAsFlowStart: OperatorFunction<
  [
    {
      clipboard: Clipboard<NodeId, NodeId>;
      flow: FlowId;
      originStart?: NodeId;
    },
  ]
> = ({flow, clipboard, originStart}) =>
  getPasteNode(clipboard, insertNodeAsFlowStart({flow, originStart}));
