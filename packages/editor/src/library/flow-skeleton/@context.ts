import {createContext, useContext} from 'react';

import {IFlowSkeletonEditor} from './editor';
import {IFlow} from './flow-skeleton';

interface FlowSkeletonContext {
  readonly?: boolean;
  editor?: IFlowSkeletonEditor<IFlow>;
}

export const FlowSkeletonContext = createContext<FlowSkeletonContext>(
  undefined!,
);

export const useSkeletonContext = (): FlowSkeletonContext =>
  useContext(FlowSkeletonContext);
