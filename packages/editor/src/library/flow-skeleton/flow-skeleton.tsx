import React, {
  FC,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import styled from 'styled-components';

import {Action} from './@actions';
import {Flow} from './@flow';
import {Navigation} from './@navigation';
import {
  ActiveState,
  FlowSkeletonContext,
  FlowSkeletonContextProvider,
} from './context';

const Wrapper = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

const Content = styled.div`
  height: 100%;
  width: 100%;
  padding: 64px;
  box-sizing: border-box;
  text-align: center;
  overflow: auto;
  background-color: #e5e7eb;
`;

export interface INode {
  id: string;
  nexts: INode[];
  /**
   * INode with flows was seen as BranchesNode
   */
  flows?: IFlow[];
}

export interface IFlow {
  id: string;
  starts: INode[];
}

export type FlowAction<TFlow extends IFlow> = Action<TFlow>;

export type FlowSkeletonProps<TFLow extends IFlow> =
  | (FlowSkeletonCommonProps<TFLow> & FlowSkeletonPropsReadonlySegment)
  | (FlowSkeletonCommonProps<TFLow> & FlowSkeletonPropsEditingSegment<TFLow>);

interface FlowSkeletonCommonProps<TFLow extends IFlow> {
  flow: TFLow;
  nodeRender: FC<{node: TFLow['starts'][number]}>;
}

interface FlowSkeletonPropsReadonlySegment {
  readonly: true;
}

interface FlowSkeletonPropsEditingSegment<TFLow extends IFlow> {
  onAction: FlowSkeletonContext<TFLow>['onAction'];
}

export const FlowSkeleton = <TFlow extends IFlow>({
  flow,
  nodeRender,
  children,
  ...props
}: PropsWithChildren<FlowSkeletonProps<TFlow>>): ReactElement<any, any> => {
  const [active, setActive] = useState<IFlow | INode | undefined>();

  const [activeState, setActiveState] = useState<ActiveState>();

  const isActive = useCallback(
    (source?: IFlow | INode) => (source ? source.id === active?.id : !!active),
    [active],
  );

  const onContentClick = (): void => {
    setActive(undefined);
    setActiveState(undefined);
  };

  const context: FlowSkeletonContext<any> = {
    active,
    setActive,
    isActive,
    activeState,
    setActiveState,
    ...props,
  };

  useEffect(() => {
    setActiveState(undefined);
  }, [active]);

  return (
    <Wrapper className="flow-skeleton">
      <FlowSkeletonContextProvider value={context}>
        <Content onClick={onContentClick}>
          {context.readonly ? (
            <>
              <Flow flow={flow} nodeRender={nodeRender} root />
              {children}
            </>
          ) : (
            <>
              <Navigation />
              <Flow flow={flow} nodeRender={nodeRender} root />
              {children}
            </>
          )}
        </Content>
      </FlowSkeletonContextProvider>
    </Wrapper>
  );
};
