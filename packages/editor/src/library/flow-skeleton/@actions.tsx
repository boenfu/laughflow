import {Copy, Cut, Jump, More, Plus, Trash, Union} from '@magicflow/icons';
import {FC} from 'react';

import {IFlow, INode} from './flow-skeleton';

export interface IAction {
  type: string;
  icon: FC;
  title: string;
  tip?: string;
}

const AddNodeAction: IAction = {
  type: 'add-node',
  icon: Plus,
  title: '添加普通节点',
};

const AddBranchesNodeAction: IAction = {
  type: 'add-branches-node',
  icon: Union,
  title: '添加分支节点',
};

const DeleteAction: IAction = {
  type: 'delete',
  icon: Trash,
  title: '删除',
};

const MoreAction: IAction = {
  type: 'more',
  icon: More,
  title: '更多',
};

const ConnectNodeAction: IAction = {
  type: 'connect-node',
  icon: Jump,
  title: '连接节点',
};

const CutNodeAction: IAction = {
  type: 'cut-node',
  icon: Cut,
  title: '剪切节点',
};

const CopyNodeAction: IAction = {
  type: 'copy-node',
  icon: Copy,
  title: '复制节点',
};

const NodeActions: IAction[] = [
  AddNodeAction,
  AddBranchesNodeAction,
  ConnectNodeAction,
  CutNodeAction,
  CopyNodeAction,
  DeleteAction,
  MoreAction,
];

const BranchesOrFlowNodeActions: IAction[] = [
  AddNodeAction,
  AddBranchesNodeAction,
  DeleteAction,
];

export function getActions(source: IFlow | INode): IAction[] {
  if ('flows' in source || 'starts' in source) {
    return BranchesOrFlowNodeActions;
  }

  return NodeActions;
}
