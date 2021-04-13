import {More, Trash} from '@magicflow/icons';

import {
  ProcedureEditor,
  createNode,
  deleteNode,
} from '../../../procedure-editor';

import {ActionDefinition} from './actions';

const ACTIONS = [
  {
    type: 'trash',
    icon: Trash,
    title: '删除分支',
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

export const flowActionDefinition: ActionDefinition = {
  actions: ACTIONS,
  handler,
};
