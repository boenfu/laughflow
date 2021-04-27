import {Copy, Cut, Jump} from '@magicflow/icons';
import {ProcedureSingleTreeNode} from '@magicflow/procedure';
import classnames from 'classnames';
import React, {FC, createElement} from 'react';
import styled from 'styled-components';

import {RESOURCE_WIDTH} from '../../../@common';
import {useEditorContext} from '../../../flow-context';
import {ActiveState} from '../../../procedure-editor';

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

const EditingIconWrapper = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;

  top: 100%;
  left: 50%;
  transform: translate(-50%, 2px);

  background: #296dff;
  color: #fff;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.08);
  border-radius: 28px;

  z-index: 3;
`;

const STATE_ICON_DICT: Partial<{[key in ActiveState]: React.ElementType}> = {
  cut: Cut,
  copy: Copy,
  connect: Jump,
};

const EditingIcon: FC<{state: ActiveState}> = ({state}) => {
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
  readOnly?: boolean;
}

export const SingleNode: FC<SingleNodeProps> = ({className, node}) => {
  const {editor} = useEditorContext();

  let activeInfo = editor.activeInfo;
  let active = editor.isActive(node);
  let editing = active ? activeInfo?.state : undefined;

  let {before, after, footer, body} = editor.nodeRenderDescriptor['singleNode'];

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
