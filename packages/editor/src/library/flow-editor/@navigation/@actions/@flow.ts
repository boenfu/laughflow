import {Add, More, Trash} from '@magicflow/icons';
import {removeBranchesNodeFlow} from '@magicflow/procedure/operators';

import {
  ProcedureEditor,
  createNodeAsFlowStart,
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

  if (!activeInfo || activeInfo.value.type !== 'flow') {
    return;
  }

  switch (type) {
    case 'singleNode':
    case 'branchesNode':
      editor.edit(
        createNodeAsFlowStart({type, flow: activeInfo.value.id}),
        true,
      );
      break;
    case 'trash': {
      if (!activeInfo.value.parent) {
        break;
      }

      editor.edit(
        removeBranchesNodeFlow(activeInfo.value.parent.id, activeInfo.value.id),
      );

      break;
    }
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
