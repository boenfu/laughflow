import {ProcedureSingleTreeNode} from '@magicflow/procedure';
import classnames from 'classnames';
import React, {FC, createElement, useContext} from 'react';
import styled from 'styled-components';

import {useSkeletonContext} from '../../flow-skeleton';
import {FlowViewerContext} from '../flow-viewer';

import {Header} from './@header';

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
  width: 220px;
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
      transform: translate(-10px, -10px);
      padding: 10px;
      position: absolute;
      top: 0px;
      left: 0px;
      width: 100%;
      content: '';
      z-index: 2;
      border: 1px dashed #a9b7d7;
      border-radius: 4px;
      pointer-events: none;
    }

    &:hover {
      &::before {
        opacity: 1;
      }
    }

    &.active {
      &::before {
        opacity: 1;
        background-color: rgba(255, 255, 255, 0.88);
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

const LinkNode = styled.div`
  min-width: 64px;
  max-width: 110px;
  padding: 8px 12px;
  height: 16px;
  line-height: 16px;
  font-size: 12px;
  margin: 0 14px;
  background-color: #ffffff;
  text-overflow: ellipsis;
  overflow: hidden;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.07);
  border-radius: 28px;
`;

const Container = styled.div`
  position: relative;
`;

export interface SingleNodeProps {
  node: ProcedureSingleTreeNode;
  className?: string;
}

export const SingleNode: FC<SingleNodeProps> = ({className, node}) => {
  const {editor} = useContext(FlowViewerContext);
  const {isActive} = useSkeletonContext();

  if (node.left) {
    return (
      <Container onClick={event => event.stopPropagation()}>
        <LinkNode>{node.definition.displayName}</LinkNode>
      </Container>
    );
  }

  let {before, after, footer, body} = editor.nodeRenderDescriptor.node;

  let active = isActive(node);

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
            active,
          },
        ])}
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
