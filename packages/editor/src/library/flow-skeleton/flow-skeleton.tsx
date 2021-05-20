import React, {FC, ReactElement, useCallback, useState} from 'react';
import styled from 'styled-components';

import {FlowSkeletonContext} from './@context';
import {Flow} from './@flow';
import {Footer} from './@footer';
import {Navigation} from './@navigation';

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
  ...props
}: FlowSkeletonProps<TFlow>): ReactElement<any, any> => {
  const [active, setActive] = useState<IFlow | INode | undefined>();

  const isActive = useCallback(
    (source?: IFlow | INode) => (source ? source.id === active?.id : !!active),
    [active],
  );

  const onContentClick = (): void => setActive(undefined);

  const context: FlowSkeletonContext<IFlow> = {
    active,
    setActive,
    isActive,
    ...props,
  };

  return (
    <Wrapper className="flow-skeleton">
      <FlowSkeletonContext.Provider value={context}>
        <Content onClick={onContentClick}>
          {context.readonly ? (
            <Flow flow={flow} nodeRender={nodeRender} root />
          ) : (
            <>
              <Navigation />
              <Flow flow={flow} nodeRender={nodeRender} root />
              <Footer />
            </>
          )}
        </Content>
      </FlowSkeletonContext.Provider>
    </Wrapper>
  );
};
