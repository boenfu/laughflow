import {IFlow, INode} from './flow-skeleton';

export interface IAction<
  TType extends string,
  TTarget extends IFlow | INode | undefined,
  TPosition extends ActionPosition | undefined = undefined
> {
  type: TType;
  target: TTarget;
  position: TPosition;
}

export type ActionPosition =
  | INode
  | [INode]
  | [INode, INode]
  | IFlow
  | [IFlow, INode]
  | [IFlow];

export type Action<TFlow extends IFlow = IFlow> =
  | NodeAction<TFlow>
  | BranchesNodeAction<TFlow>
  | FlowAction<TFlow>;

type _NodeAction<
  TFlow extends IFlow = IFlow,
  TNode extends INode = Exclude<TFlow['starts'][number], {flows: any}>
> =
  | AddNodeAction<TNode>
  | AddBranchesNodeAction<TNode>
  | ConnectNodeAction<TNode>
  | NodeActionWithPresetPosition<'add', TFlow, undefined>
  | NodeActionWithPresetPosition<'move', TFlow, TNode>
  | NodeActionWithPresetPosition<'copy', TFlow, TNode>
  | DeleteAction<TNode>
  | ConfigureNodeAction<TNode>;

export type NodeAction<TFlow extends IFlow = IFlow> = ActionWithPrefix<
  _NodeAction<TFlow>,
  'node'
>;

type _BranchesNodeAction<
  TFlow extends IFlow = IFlow,
  TBranchesNode extends INode = Extract<TFlow['starts'][number], {flows?: any}>
> =
  | AddNodeAction<TBranchesNode>
  | AddBranchesNodeAction<TBranchesNode>
  | NodeActionWithPresetPosition<'add', TFlow, undefined>
  | AddFlowAction<TBranchesNode>
  | DeleteAction<TBranchesNode>;

export type BranchesNodeAction<TFlow extends IFlow = IFlow> = ActionWithPrefix<
  _BranchesNodeAction<TFlow>,
  'branches-node'
>;

type _FlowAction<TFlow extends IFlow = IFlow> =
  | AddNodeAction<TFlow>
  | AddBranchesNodeAction<TFlow>
  | DeleteAction<TFlow>;

export type FlowAction<TFlow extends IFlow = IFlow> = ActionWithPrefix<
  _FlowAction<TFlow>,
  'flow'
>;

type ActionWithPrefix<
  TAction extends IAction<string, any, any>,
  P extends string
> = [TAction['type']] extends [infer TType]
  ? TType extends string
    ? {
        type: `${P}:${TType}`;
      } & Omit<Extract<TAction, {type: TType}>, 'type'>
    : never
  : never;

type AddNodeAction<T extends IFlow | INode> = IAction<'add-node', T>;

type AddBranchesNodeAction<T extends IFlow | INode> = IAction<
  'add-branches-node',
  T
>;

type AddFlowAction<T extends INode> = IAction<'add-flow', T>;

type ConnectNodeAction<T extends INode> = IAction<'connect-node', T, T>;

export interface SuffixToPosition<
  TFlow extends IFlow = IFlow,
  TNode extends INode = TFlow['starts'][number]
> {
  'between-nodes': [TNode, TNode];
  'after-node': [TNode];
  'between-flow-and-node': [TFlow, TNode];
  'after-flow': [TFlow];
}

type NodeActionWithPresetPosition<
  TType extends string,
  TFlow extends IFlow,
  TTarget extends INode | undefined
> = [keyof SuffixToPosition] extends [infer TSuffix]
  ? TSuffix extends keyof SuffixToPosition
    ? IAction<`${TType}-${TSuffix}`, TTarget, SuffixToPosition<TFlow>[TSuffix]>
    : never
  : never;

type ConfigureNodeAction<T extends INode> = IAction<'configure-node', T>;

type DeleteAction<T extends IFlow | INode> = IAction<'delete', T>;
