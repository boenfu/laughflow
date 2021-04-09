import {Node, NodeId} from '@magicflow/core';
// import {
//   OperatorFunction,
//   addNode as _addNode,
//   addNodeNexts,
//   out,
// } from '@magicflow/procedure/operators';

import {Clipboard} from '../@clipboard';

// import {insertNodeBeforeNexts} from './@insert-node-before-nexts';
// import {insertNodeBetweenNodes} from './@insert-node-between-nodes';

export interface PasteNodeOperatorParam {
  from?: NodeId;
  to?: NodeId;
  clipboard: Clipboard<Node>;
}

// const pasteNode: (clipboard: Clipboard<Node>) => Node = clipboard =>
//   clipboard.paste()!;

// /**
//  * 在节点之后粘贴节点
//  * @param param0
//  * @returns
//  */
// export const pasteNode: OperatorFunction<[PasteNodeOperatorParam]> = ({
//   from,
//   clipboard,
// }) => addNodeNexts(from, [_pasteNode(clipboard).id]);

// /**
//  * 在两个节点间粘贴节点
//  * @param param0
//  * @returns
//  */
// export const pasteNodeBetweenNodes: OperatorFunction<
//   [Required<PasteNodeOperatorParam>]
// > = ({from, to, type}) =>p
//   out(_pasteNode(type), ({id}) =>
//     insertNodeBetweenNodes({from, to, target: id}),
//   );

// /**
//  * 在节点之后粘贴节点并迁移 nexts
//  * @param param0
//  * @returns
//  */
// export const pasteNodeBeforeNexts: OperatorFunction<
//   [PasteNodeOperatorParam]
// > = ({from, type}) =>
//   out(_pasteNode(type), ({id}) => insertNodeBeforeNexts({from, to: id}));
