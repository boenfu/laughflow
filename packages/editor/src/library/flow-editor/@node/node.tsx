import {Copy, Cut, Jump} from '@magicflow/icons';
import {ProcedureSingleTreeNode} from '@magicflow/procedure';
import classnames from 'classnames';
import React, {FC, createElement, useContext} from 'react';
import styled from 'styled-components';

import {RESOURCE_WIDTH} from '../../@common';
import {ActiveState, useSkeletonContext} from '../../flow-skeleton';
import {FlowEditorContext} from '../flow-editor';

import {Header} from './@header';

const Container = styled.div`
  * {
    pointer-events: all !important;
  }
`;

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

const EditingIconWrapper = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;

  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  background: #83a9ff;
  color: #fff;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.08);
  border-radius: 28px;

  z-index: 3;
`;

const STATE_ICON_DICT: Partial<
  {[key in NonNullable<ActiveState>]: React.ElementType}
> = {
  moving: Cut,
  copying: Copy,
  connecting: Jump,
};

const EditingIcon: FC<{state: NonNullable<ActiveState>}> = ({state}) => {
  let Component = STATE_ICON_DICT[state];

  if (!Component) {
    return <></>;
  }

  return (
    <EditingIconWrapper>
      <Component />
    </EditingIconWrapper>
  );
};

export interface SingleNodeProps {
  node: ProcedureSingleTreeNode;
  className?: string;
}

export const SingleNode: FC<SingleNodeProps> = ({className, node}) => {
  if (node.left) {
    return <div>断电</div>;
  }

  const {editor} = useContext(FlowEditorContext);
  const {active: activeSource, activeState} = useSkeletonContext();

  let {before, after, footer, body} = editor.nodeRenderDescriptor['singleNode'];

  let active = activeSource?.id === node.id;
  let editing = active ? activeState : undefined;

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
            editing: !!editing,
          },
          editing,
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

        {editing ? <EditingIcon state={editing} /> : undefined}
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
