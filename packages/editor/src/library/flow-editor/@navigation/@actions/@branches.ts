import {Add, Check, More, Trash} from '@magicflow/icons';

import {
  ProcedureEditor,
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
    type: 'done',
    icon: Check,
    title: '展示完成情况',
  },
  {
    type: 'flow',
    icon: Add,
    title: '添加分支',
  },
  {
    type: 'trash',
    icon: Trash,
    title: '删除节点',
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
    case 'done':
      // TODO
      break;
    case 'connect':
    case 'cut':
    case 'copy':
      editor.active(type);
      break;
    case 'trash':
      editor.edit(deleteNode(activeInfo.value));

      break;
    case 'more':
      // editor.emitConfig(activeIdentity.ref);
      break;

    default:
      break;
  }
};

export const branchesNodeActionDefinition: ActionDefinition = {
  actions: ACTIONS,
  handler,
};
