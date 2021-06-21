import {ProcedureSingleTreeNode} from '@magicflow/procedure';
import {TaskSingleNode} from '@magicflow/task';
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

  &.active {
    ${Wrapper} {
      box-shadow: 0 6px 12px rgba(58, 69, 92, 0.16);
    }

    .header {
      color: #ffffff;
      background-color: #296dff;
    }
  }

  &.done {
    .header {
      color: #ffffff;
      background-color: #81cb5f;
    }
  }

  &.in-progress {
    .header {
      color: #ffffff;
      background-color: #296dff;
    }
  }

  &.terminated {
    .header {
      color: #ffffff;
      background-color: #e55a3a;
    }
  }

  &.ignored {
    opacity: 0.4;

    .header {
      color: #ffffff;
      background-color: #666;
    }
  }

  &.broken {
    opacity: 0.4;

    .header {
      color: #ffffff;
      background-color: #e55a3a;
    }
  }
`;

export interface SingleNodeProps {
  node: ProcedureSingleTreeNode | TaskSingleNode;
  className?: string;
}

export const SingleNode: FC<SingleNodeProps> = ({className, node}) => {
  const {editor, mode} = useContext(FlowViewerContext);
  const {isActive} = useSkeletonContext();

  if (mode === 'procedure' && 'left' in node && node.left) {
    return (
      <Container onClick={event => event.stopPropagation()}>
        <LinkNode>{node.definition.displayName}</LinkNode>
      </Container>
    );
  }

  let {
    before,
    after,
    footer,
    body,
  } = editor.nodeRenderDescriptorDict.procedure.node;

  let active = isActive(node);

  return (
    <Container
      className={classnames([
        className,
        {
          active,
        },
        ...(node instanceof TaskSingleNode
          ? [
              node.stage,
              {
                ignored: node.ignored,
                broken: node.broken,
              },
            ]
          : []),
      ])}
      title={
        node instanceof TaskSingleNode
          ? node.ignored
            ? '节点被忽略'
            : node.broken
            ? '节点被中断'
            : undefined
          : undefined
      }
    >
      {before?.length ? (
        <BeforeWrapper>
          {before.reduce(
            (reactNode, component) =>
              createElement(component, {node, prevChildren: reactNode}),
            <></>,
          )}
        </BeforeWrapper>
      ) : undefined}
      <Wrapper>
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
