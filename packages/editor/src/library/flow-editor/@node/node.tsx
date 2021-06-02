import {Copy, Cut, Jump, Wrong} from '@magicflow/icons';
import {ProcedureSingleTreeNode} from '@magicflow/procedure';
import classnames from 'classnames';
import React, {FC, HtmlHTMLAttributes, createElement, useContext} from 'react';
import styled from 'styled-components';

import {transition} from '../../@common';
import {ActiveState, useSkeletonContext} from '../../flow-skeleton';
import {FlowEditorContext} from '../flow-editor';

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

const DeleteIcon = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  right: -6px;
  top: -6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #e55a3a;
  color: #fff;
  font-size: 10px;
  cursor: pointer;
  opacity: 0;

  ${transition(['opacity'])}
  transition-delay: 0.2s;
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

  &:hover {
    ${DeleteIcon} {
      opacity: 1;
    }
  }

  > ${LinkNode} + ${DeleteIcon} {
    right: 8px;
  }
`;

const DeleteButton: FC<HtmlHTMLAttributes<HTMLDivElement>> = ({...props}) => {
  return (
    <DeleteIcon {...props}>
      <Wrong />
    </DeleteIcon>
  );
};

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
  const {editor} = useContext(FlowEditorContext);
  const {active: activeSource, activeState, onAction} = useSkeletonContext();

  const onDisconnectClick = (): void =>
    onAction?.({
      type: 'node:disconnect-node',
      target: node,
      position: undefined,
    });

  const onDeleteClick = (): void =>
    onAction?.({
      type: 'node:delete',
      target: node,
      position: undefined,
    });

  if (node.left) {
    return (
      <Container onClick={event => event.stopPropagation()}>
        <LinkNode>{node.definition.displayName}</LinkNode>
        <DeleteButton onClick={onDisconnectClick} />
      </Container>
    );
  }

  let {before, after, footer, body} = editor.nodeRenderDescriptor.node;

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
        <DeleteButton onClick={onDeleteClick} />
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
