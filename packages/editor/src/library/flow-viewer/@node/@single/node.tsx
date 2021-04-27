import {ProcedureSingleTreeNode} from '@magicflow/procedure';
import {TaskSingleNode} from '@magicflow/task';
import classnames from 'classnames';
import React, {FC, createElement} from 'react';
import styled from 'styled-components';

import {RESOURCE_WIDTH} from '../../../@common';
import {useViewerContext} from '../../../flow-context';

import {Header} from './@header';

const Container = styled.div``;

const BeforeWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AfterWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Wrapper = styled.div`
  position: relative;
  margin: 0 17px;
  width: ${RESOURCE_WIDTH}px;
  min-height: 83px;
  display: inline-flex;
  flex-direction: column;
  vertical-align: top;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  background-color: #fff;
  cursor: pointer;

  &:hover {
    .header {
      color: #ffffff;
      background-color: #5b6e95;
    }
  }

  &.active {
    box-shadow: 0 6px 12px rgba(58, 69, 92, 0.16);

    .header {
      color: #ffffff;
      background-color: #296dff;
    }
  }

  &.editing {
    &::before {
      opacity: 0;
      margin: 0px;
      height: 100%;
      transform: translate(-12px, -12px);
      padding: 12px;
      position: absolute;
      top: 0px;
      left: 0px;
      width: 100%;
      content: '';
      z-index: 2;
      border: 1px dashed #296dff;
      border-radius: 4px;
    }

    &:hover {
      &::before {
        opacity: 1;
      }
    }

    &.active {
      &::before {
        opacity: 1;
        background-color: rgba(255, 255, 255, 0.5);
      }
    }
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
`;

const Footer = styled.div`
  display: flex;
`;

export interface SingleNodeProps {
  node: ProcedureSingleTreeNode;
  taskNode?: TaskSingleNode;
  className?: string;
}

export const SingleNode: FC<SingleNodeProps> = ({
  className,
  node,
  taskNode,
}) => {
  const viewer = useViewerContext();

  let {before, after, footer, body} = viewer.nodeRenderDescriptor['singleNode'];

  return (
    <Container>
      {before?.length ? (
        <BeforeWrapper>
          {before.reduce(
            (reactNode, component) =>
              createElement(component, {node, prevChildren: reactNode}),
            <></>,
          )}
        </BeforeWrapper>
      ) : undefined}
      <Wrapper
        className={classnames([
          className,
          {
            active: taskNode?.stage === 'in-progress',
          },
        ])}
        data-id={node.id}
        data-prev={node.prev.id}
      >
        <Header node={node} />
        <Body>
          {body?.reduce(
            (reactNode, component) =>
              createElement(component, {node, prevChildren: reactNode}),
            <></>,
          )}
        </Body>

        <Footer>
          {footer?.reduce(
            (reactNode, component) =>
              createElement(component, {node, prevChildren: reactNode}),
            <></>,
          )}
        </Footer>
      </Wrapper>
      {after?.length ? (
        <AfterWrapper>
          {after.reduce(
            (reactNode, component) =>
              createElement(component, {node, prevChildren: reactNode}),
            <></>,
          )}
        </AfterWrapper>
      ) : undefined}
    </Container>
  );
};
