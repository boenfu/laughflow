import {createContext, useContext} from 'react';

import type {Action} from './@actions';
import type {IFlow} from './flow-skeleton';

export type ActiveState = 'moving' | 'copying' | 'connecting' | undefined;

export interface FlowSkeletonContext<
  TFlow extends IFlow,
  TNode = TFlow['starts'][number],
> {
  active: TFlow | TNode | undefined;
  activeState: ActiveState;
  setActiveState(state: ActiveState): void;
  setActive(source: TFlow | TNode | undefined): void;
  isActive(source?: TFlow | TNode): boolean;

  readonly?: boolean;

  nodeNextsRender?(node: TNode): boolean;
  onAction?(action: Action<TFlow>): void;
}

const FlowSkeletonContext = createContext<FlowSkeletonContext<IFlow>>(
  undefined!,
);

export const FlowSkeletonContextProvider = FlowSkeletonContext.Provider;

export const useSkeletonContext = <
  TFlow extends IFlow,
>(): FlowSkeletonContext<TFlow> =>
  useContext(FlowSkeletonContext) as FlowSkeletonContext<TFlow>;
