import {Copy, Cut, Jump, More, Plus, Trash, Union} from '@magicflow/icons';
import {FC} from 'react';

import {ActiveState} from './context';
import {IFlow, INode} from './flow-skeleton';

export interface IMenu {
  type: string;
  icon: FC;
  title: string;
  tip?: string;
  state?: ActiveState;
}

const AddNodeMenu: IMenu = {
  type: 'add-node',
  icon: Plus,
  title: '添加普通节点',
};

const AddBranchesNodeMenu: IMenu = {
  type: 'add-branches-node',
  icon: Union,
  title: '添加分支节点',
};

const DeleteMenu: IMenu = {
  type: 'delete',
  icon: Trash,
  title: '删除',
};

const MoreMenu: IMenu = {
  type: 'more',
  icon: More,
  title: '更多',
};

const ConnectNodeMenu: IMenu = {
  type: 'connect-node',
  icon: Jump,
  title: '连接节点',
  state: 'connecting',
};

const CutNodeMenu: IMenu = {
  type: 'cut-node',
  icon: Cut,
  title: '剪切节点',
  state: 'cutting',
};

const CopyNodeMenu: IMenu = {
  type: 'copy-node',
  icon: Copy,
  title: '复制节点',
  state: 'copying',
};

const NodeMenus: IMenu[] = [
  AddNodeMenu,
  AddBranchesNodeMenu,
  ConnectNodeMenu,
  CutNodeMenu,
  CopyNodeMenu,
  DeleteMenu,
  MoreMenu,
];

const BranchesOrFlowNodeMenus: IMenu[] = [
  AddNodeMenu,
  AddBranchesNodeMenu,
  DeleteMenu,
];

export function getMenus(source: IFlow | INode): IMenu[] {
  if ('flows' in source || 'starts' in source) {
    return BranchesOrFlowNodeMenus;
  }

  return NodeMenus;
}
