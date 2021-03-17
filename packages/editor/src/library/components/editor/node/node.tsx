import {NodeMetadata, NodeRef, TrunkRef} from '@magicflow/core';
import {Connect, Copy, Cut} from '@magicflow/icons';
import classnames from 'classnames';
import React, {
  CSSProperties,
  FC,
  MouseEvent,
  createElement,
  useContext,
} from 'react';
import styled from 'styled-components';

import {EditorContext} from '../../../context';
import {ActiveTrunk} from '../../../editor';
import {transition} from '../../common';

import {DisplayName} from './@header';

export interface NodeProps {
  prev: TrunkRef | undefined;
  node: NodeMetadata;
  className?: string;
  readOnly?: boolean;
  style?: CSSProperties;
}

const Container = styled.div`
  display: inline-block;
  text-align: center;
  white-space: nowrap;
  vertical-align: top;
`;

const Header = styled.div`
  display: flex;
  height: 42px;
  box-sizing: border-box;
  padding: 0 16px;
  align-items: center;
  font-size: 14px;
  color: #333333;
  background-color: #f7f7f7;
  border-bottom: 1px solid rgba(16, 42, 100, 0.08);
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;

  ${transition(['background-color', 'color'])}
`;

const HeaderExtra = styled.div`
  flex: none;
`;

const Wrapper = styled.div`
  position: relative;
  margin: 0 17px;
  width: 220px;
  display: inline-block;
  vertical-align: top;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  background-color: #fff;

  &:hover {
    ${Header} {
      color: #ffffff;
      background-color: #5b6e95;
    }
  }

  &.active {
    box-shadow: 0 6px 12px rgba(58, 69, 92, 0.16);

    ${Header} {
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

    &.selected,
    &.active {
      &::before {
        opacity: 1;
        background-color: rgba(255, 255, 255, 0.5);
      }
    }
  }
`;

const Body = styled.div``;

const Footer = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
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
  transform: translate(-50%, -4px);

  background: #296dff;
  color: #fff;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.08);
  border-radius: 28px;

  z-index: 3;
`;

const STATE_ICON_DICT: Partial<
  {[key in ActiveTrunk['state']]: React.ElementType}
> = {
  joining: Connect,
  cutting: Cut,
  copying: Copy,
};

const EditingIcon: FC<{state: ActiveTrunk['state']}> = ({state}) => {
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

export const Node: FC<NodeProps> = ({
  className,
  style,
  prev,
  node,
  children,
}) => {
  const {editor} = useContext(EditorContext);

  let {
    before,
    after,
    headLeft,
    headRight,
    footer,
    body,
  } = editor.getNodeRenderDescriptor(node);

  let nodeRef: NodeRef = {type: 'node', id: node.id};

  let activeTrunk = editor.activeTrunk;

  const onNodeChange = (node: NodeMetadata): void =>
    void editor.procedure.updateNode(node);

  const onContainerClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (activeTrunk?.state === 'connecting') {
      void editor.procedure.connectNode(activeTrunk.ref, nodeRef);
      return;
    }

    if (activeTrunk?.state === 'joining') {
      editor.setActiveTrunk({
        ...activeTrunk,
        relationTrunks: [...(activeTrunk.relationTrunks || []), nodeRef],
      });
      event.stopPropagation();
    }

    void editor.setActiveTrunk({
      prev,
      ref: nodeRef,
      state: 'none',
    });

    event.stopPropagation();
  };

  let editing = activeTrunk && activeTrunk?.state !== 'none';
  let active = activeTrunk?.ref?.id === node.id;

  return (
    <Container style={style}>
      {before && createElement(before, {node})}
      <Wrapper
        className={classnames([
          className,
          {
            editing,
            active,
            selected: activeTrunk?.relationTrunks?.some(
              ref => ref.id === node.id,
            ),
          },
        ])}
        onClick={onContainerClick}
      >
        <Header>
          {headLeft && (
            <HeaderExtra>{createElement(headLeft, {node})}</HeaderExtra>
          )}

          <DisplayName node={node} onChange={onNodeChange} />
          {headRight && (
            <HeaderExtra>{createElement(headRight, {node})}</HeaderExtra>
          )}
          {before && createElement(before, {node})}
        </Header>
        <Body>{body && createElement(body, {node})}</Body>
        <Footer>{footer && createElement(footer, {node})}</Footer>

        {editing && active ? (
          <EditingIcon state={activeTrunk!.state} />
        ) : undefined}
      </Wrapper>
      {after && createElement(after, {node})}
      {children}
    </Container>
  );
};
