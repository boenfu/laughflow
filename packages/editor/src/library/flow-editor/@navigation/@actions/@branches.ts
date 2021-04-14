import {Add, More, Trash} from '@magicflow/icons';

import {
  ProcedureEditor,
  createFlow,
  createNode,
  deleteNode,
} from '../../../procedure-editor';

import {ActionDefinition} from './actions';

const ACTIONS = [
  {
    type: 'singleNode',
    icon: Add,
    title: '添加普通节点',
  },
  {
    type: 'branchesNode',
    icon: Add,
    title: '添加分支节点',
  },
  {
    type: 'flow',
    icon: Add,
    title: '添加新分支',
  },
  {
    type: 'trash',
    icon: Trash,
    title: '删除分支节点',
  },
  {
    type: 'more',
    icon: More,
    title: '更多',
  },
];

const handler = (
  editor: ProcedureEditor,
  type: typeof ACTIONS[number]['type'],
): void => {
  let activeInfo = editor.activeInfo;

  if (!activeInfo || activeInfo.value.type === 'flow') {
    return;
  }

  switch (type) {
    case 'singleNode':
    case 'branchesNode':
      editor.edit(createNode({type, from: activeInfo.value.id}));
      break;
    case 'flow':
      editor.edit(createFlow({node: activeInfo.value.id}));
      break;
    case 'trash':
      editor.edit(deleteNode(activeInfo.value));
      break;
    case 'more':
      editor.emitConfig(activeInfo.value);
      break;
    default:
      break;
  }
};

export const branchesNodeActionDefinition: ActionDefinition = {
  actions: ACTIONS,
  handler,
};
