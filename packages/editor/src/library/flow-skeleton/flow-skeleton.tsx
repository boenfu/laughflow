import React, {FC, ReactElement, useCallback, useState} from 'react';
import styled from 'styled-components';

import {FlowSkeletonContext} from './@context';
import {Flow} from './@flow';
import {Footer} from './@footer';
import {IFlowSkeletonEditor} from './editor';

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

export interface FlowSkeletonProps<TFLow extends IFlow> {
  flow: TFLow;
  nodeRender: FC<{node: TFLow['starts'][number]}>;
  editor?: IFlowSkeletonEditor<TFLow>;
}

export const FlowSkeleton = <TFlow extends IFlow>({
  flow,
  nodeRender,
  editor,
}: FlowSkeletonProps<TFlow>): ReactElement<any, any> => {
  const readonly = !editor;

  const [active, setActive] = useState<IFlow | INode | undefined>();
  const isActive = useCallback(
    (source: IFlow | INode) => source.id === active?.id,
    [active],
  );
  const onContentClick = (): void => setActive(undefined);

  return (
    <Wrapper>
      <FlowSkeletonContext.Provider
        value={{
          editor: {
            active: setActive,
            isActive,
          },
          readonly,
        }}
      >
        <Content onClick={onContentClick}>
          {readonly ? (
            <Flow flow={flow} nodeRender={nodeRender} root />
          ) : (
            <>
              <Flow flow={flow} nodeRender={nodeRender} root />
              <Footer />
            </>
          )}
        </Content>
      </FlowSkeletonContext.Provider>
    </Wrapper>
  );
};
