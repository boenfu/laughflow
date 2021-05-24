import {createContext, useContext} from 'react';

import {IAction} from './@actions';
import {IFlow} from './flow-skeleton';

export type ActiveState = 'cutting' | 'copying' | 'connecting' | undefined;

export interface FlowSkeletonContext<
  TFlow extends IFlow,
  TNode = TFlow['starts'][number]
> {
  active: TFlow | TNode | undefined;
  activeState: ActiveState;
  setActiveState(state: ActiveState): void;
  setActive(source: TFlow | TNode | undefined): void;
  isActive(source?: TFlow | TNode): boolean;

  readonly?: boolean;

  onAction?(action: IAction): void;
}

export const FlowSkeletonContext = createContext<FlowSkeletonContext<IFlow>>(
  undefined!,
);

export const useSkeletonContext = <
  TFlow extends IFlow
>(): FlowSkeletonContext<TFlow> =>
  useContext(FlowSkeletonContext) as FlowSkeletonContext<TFlow>;
