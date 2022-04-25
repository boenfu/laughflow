import {Copy, Cut, Jump, More, Plus, Trash, Union} from '@laughflow/icons';
import type {FC} from 'react';

import type {
  Action,
  BranchesNodeAction,
  FlowAction,
  NodeAction,
} from './@actions';
import type {ActiveState} from './context';
import type {IFlow, INode} from './flow-skeleton';

export interface IMenu {
  type: string;
  icon: FC;
  title: string;
  tip?: string;
  state?: ActiveState;
  clearActive?: boolean;
  action?(target: IFlow | INode): Action;
}

type IBranchesNode = Required<INode>;

interface ActionTypeDict {
  flow: FlowAction;
  'branches-node': BranchesNodeAction;
  node: NodeAction;
}

const AddNodeMenu: IMenu = {
  type: 'add-node',
  icon: Plus,
  title: '添加普通节点',
  action: target =>
    getTypeValue<ActionTypeDict>(target, {
      flow: {
        type: 'flow:add-node',
        target: target as IFlow,
        position: undefined,
      },
      'branches-node': {
        type: 'branches-node:add-node',
        target: target as IBranchesNode,
        position: undefined,
      },
      node: {
        type: 'node:add-node',
        target: target as INode,
        position: undefined,
      },
    }),
};

const AddBranchesNodeMenu: IMenu = {
  type: 'add-branches-node',
  icon: Union,
  title: '添加分支节点',
  action: target =>
    getTypeValue<ActionTypeDict>(target, {
      flow: {
        type: 'flow:add-branches-node',
        target: target as IFlow,
        position: undefined,
      },
      'branches-node': {
        type: 'branches-node:add-branches-node',
        target: target as IBranchesNode,
        position: undefined,
      },
      node: {
        type: 'node:add-branches-node',
        target: target as INode,
        position: undefined,
      },
    }),
};

const DeleteMenu: IMenu = {
  type: 'delete',
  icon: Trash,
  title: '删除',
  clearActive: true,
  action: target =>
    getTypeValue<ActionTypeDict>(target, {
      flow: {
        type: 'flow:delete',
        target: target as IFlow,
        position: undefined,
      },
      'branches-node': {
        type: 'branches-node:delete',
        target: target as IBranchesNode,
        position: undefined,
      },
      node: {
        type: 'node:delete',
        target: target as INode,
        position: undefined,
      },
    }),
};

const MoreMenu: IMenu = {
  type: 'more',
  icon: More,
  title: '更多',
  action: (target: INode) => ({
    type: 'node:configure-node',
    target,
    position: undefined,
  }),
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
  state: 'moving',
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
  return getTypeValue(source, {
    flow: BranchesOrFlowNodeMenus,
    'branches-node': BranchesOrFlowNodeMenus,
    node: NodeMenus,
  });
}

function getTypeValue<TValue, TSource extends IFlow | INode = IFlow | INode>(
  source: TSource,
  valueDict: TValue extends Record<'flow' | 'node' | 'branches-node', any>
    ? TValue
    : Record<'flow' | 'node' | 'branches-node', TValue>,
): TValue extends Record<'flow' | 'node' | 'branches-node', any>
  ? TValue[keyof TValue]
  : TValue {
  return 'starts' in source
    ? valueDict['flow']
    : 'flows' in source
    ? valueDict['branches-node']
    : valueDict['node'];
}
