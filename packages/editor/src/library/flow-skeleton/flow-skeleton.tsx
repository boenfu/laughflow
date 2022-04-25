import {useKeyPress} from 'ahooks';
import type {FC, PropsWithChildren, ReactElement} from 'react';
import React, {useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';

import type {Action} from './@actions';
import {Flow} from './@flow';
import {Navigation} from './@navigation';
import type {ActiveState, FlowSkeletonContext} from './context';
import {FlowSkeletonContextProvider} from './context';

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
  nodeNextsRender?(node: TFLow['starts'][number]): boolean;
  isNodeActive?(node: TFLow['starts'][number]): boolean;
}

interface FlowSkeletonPropsReadonlySegment {
  readonly: true;
}

interface FlowSkeletonPropsEditingSegment<TFLow extends IFlow> {
  onAction: FlowSkeletonContext<TFLow>['onAction'];
  /**
   * 因 props flow 可以传入引用完全不同的对象，
   * 此时 active 存储的内容可能与新 flow 中的内容有差异或已不存在
   * @param active
   */
  activeFormatter?(
    active: TFLow | TFLow['starts'][number],
  ): TFLow | TFLow['starts'][number] | undefined;
}

export const FlowSkeleton = <TFlow extends IFlow>({
  flow,
  nodeRender,
  nodeNextsRender,
  isNodeActive,
  children,
  ...props
}: PropsWithChildren<FlowSkeletonProps<TFlow>>): ReactElement<any, any> => {
  const [active, setActive] = useState<IFlow | INode | undefined>();

  const [activeState, setActiveState] = useState<ActiveState>();

  const isActive = useCallback(
    (source?: IFlow | INode) =>
      isNodeActive
        ? isNodeActive(source as any)
        : source
        ? source.id === active?.id
        : !!active,
    [active, isNodeActive],
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
    nodeNextsRender,
    ...props,
  };

  useEffect(() => {
    setActiveState(undefined);
  }, [active]);

  useEffect(() => {
    if (!('activeFormatter' in props) || !props.activeFormatter || !active) {
      return;
    }

    setActive(props.activeFormatter(active as any));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow, setActive]);

  useKeyPress('esc', () =>
    activeState ? setActiveState(undefined) : setActive(undefined),
  );

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
