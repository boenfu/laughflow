import type {ProcedureFlow} from '@laughflow/procedure';
import {
  addNodeNexts,
  compose,
  removeFlow,
} from '@laughflow/procedure/operators';

import type {FlowAction as Action} from '../flow-skeleton';
import type {ProcedureEditor} from '../procedure-editor';
import {
  createFlow,
  createNode,
  createNodeAsFlowStart,
  createNodeBeforeNexts,
  createNodeBetweenNodes,
  deleteLinkNode,
  deleteNode,
  pasteNodeAsFlowStart,
  pasteNodeBeforeNexts,
  pasteNodeBetweenNodes,
} from '../procedure-editor';

const ACTION_HANDLER_DICT: {
  [TKey in Action<ProcedureFlow>['type']]: (
    editor: ProcedureEditor,
    action: Extract<Action<ProcedureFlow>, {type: TKey}>,
  ) => void;
} = {
  'node:add-after-flow': (editor, action) => {
    editor.edit(
      createNodeAsFlowStart({
        flow: action.position[0].id,
        originStart: 'all',
        type: 'singleNode',
      }),
    );
  },
  'node:add-after-node': (editor, action) => {
    editor.edit(
      createNodeBeforeNexts({
        from: action.position[0].id,
        type: 'singleNode',
      }),
    );
  },
  'node:add-between-flow-and-node': (editor, action) => {
    editor.edit(
      createNodeAsFlowStart({
        flow: action.position[0].id,
        originStart: action.position[1].id,
        type: 'singleNode',
      }),
    );
  },
  'node:add-between-nodes': (editor, action) => {
    editor.edit(
      createNodeBetweenNodes({
        from: action.position[0].id,
        to: action.position[1].id,
        type: 'singleNode',
      }),
    );
  },
  'node:add-branches-node': (editor, action) => {
    editor.edit(
      createNode({
        from: action.target.id,
        type: 'branchesNode',
      }),
    );
  },
  'node:add-node': (editor, action) => {
    editor.edit(
      createNode({
        from: action.target.id,
        type: 'singleNode',
      }),
    );
  },
  'node:configure-node': (editor, action) => {
    editor.emitConfig(action.target);
  },
  'node:connect-node': (editor, action) => {
    editor.edit(addNodeNexts(action.position.id, [action.target.id]));
  },
  'node:disconnect-node': (editor, {target}) => {
    editor.edit(deleteLinkNode(target));
  },
  'node:copy-after-flow': (editor, action) => {
    editor.edit(
      pasteNodeAsFlowStart({
        flow: action.position[0].id,
        node: action.target,
        originStart: 'all',
        type: 'copy',
      }),
    );
  },
  'node:copy-after-node': (editor, action) => {
    editor.edit(
      pasteNodeBeforeNexts({
        node: action.target,
        from: action.position[0].id,
        type: 'copy',
      }),
    );
  },
  'node:copy-between-flow-and-node': (editor, action) => {
    editor.edit(
      pasteNodeAsFlowStart({
        flow: action.position[0].id,
        node: action.target,
        originStart: action.position[1].id,
        type: 'copy',
      }),
    );
  },
  'node:copy-between-nodes': (editor, action) => {
    editor.edit(
      pasteNodeBetweenNodes({
        node: action.target,
        from: action.position[0].id,
        to: action.position[1].id,
        type: 'copy',
      }),
    );
  },
  'node:delete': (editor, action) => {
    editor.edit(deleteNode(action.target));
  },
  'node:move-after-flow': (editor, action) => {
    editor.edit(
      pasteNodeAsFlowStart({
        flow: action.position[0].id,
        node: action.target,
        originStart: 'all',
        type: 'move',
      }),
    );
  },
  'node:move-after-node': (editor, action) => {
    editor.edit(
      pasteNodeBeforeNexts({
        node: action.target,
        from: action.position[0].id,
        type: 'move',
      }),
    );
  },
  'node:move-between-flow-and-node': (editor, action) => {
    editor.edit(
      pasteNodeAsFlowStart({
        flow: action.position[0].id,
        node: action.target,
        originStart: action.position[1].id,
        type: 'move',
      }),
    );
  },
  'node:move-between-nodes': (editor, action) => {
    editor.edit(
      pasteNodeBetweenNodes({
        node: action.target,
        from: action.position[0].id,
        to: action.position[1].id,
        type: 'move',
      }),
    );
  },

  'branches-node:add-branches-node': (editor, action) => {
    editor.edit(
      createNode({
        from: action.target.id,
        type: 'branchesNode',
      }),
    );
  },
  'branches-node:add-flow': (editor, action) => {
    editor.edit(
      createFlow({
        node: action.target.id,
      }),
    );
  },
  'branches-node:add-node': (editor, action) => {
    editor.edit(
      createNode({
        from: action.target.id,
        type: 'singleNode',
      }),
    );
  },
  'branches-node:add-after-flow': (editor, action) => {
    editor.edit(
      createNodeAsFlowStart({
        flow: action.position[0].id,
        originStart: 'all',
        type: 'branchesNode',
      }),
    );
  },
  'branches-node:add-after-node': (editor, action) => {
    editor.edit(
      createNodeBeforeNexts({
        from: action.position[0].id,
        type: 'branchesNode',
      }),
    );
  },
  'branches-node:add-between-flow-and-node': (editor, action) => {
    editor.edit(
      createNodeAsFlowStart({
        flow: action.position[0].id,
        originStart: action.position[1].id,
        type: 'branchesNode',
      }),
    );
  },
  'branches-node:add-between-nodes': (editor, action) => {
    editor.edit(
      createNodeBetweenNodes({
        from: action.position[0].id,
        to: action.position[1].id,
        type: 'branchesNode',
      }),
    );
  },
  'branches-node:delete': (editor, action) => {
    editor.edit(deleteNode(action.target));
  },

  'flow:add-branches-node': (editor, action) => {
    editor.edit(
      createNodeAsFlowStart({
        flow: action.target.id,
        type: 'branchesNode',
      }),
    );
  },
  'flow:add-node': (editor, action) => {
    editor.edit(
      createNodeAsFlowStart({
        flow: action.target.id,
        type: 'singleNode',
      }),
    );
  },
  'flow:delete': (editor, action) => {
    editor.edit(
      compose([removeFlow(action.target.parent!.id, action.target.id)]),
    );
  },
};

export function actionHandler<TAction extends Action<ProcedureFlow>>(
  editor: ProcedureEditor,
  action: TAction,
): void {
  return ACTION_HANDLER_DICT[action.type](editor, action as any);
}
