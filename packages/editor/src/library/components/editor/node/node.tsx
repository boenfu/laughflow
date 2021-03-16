import {NodeMetadata, NodeRef, TrunkRef} from '@magicflow/core';
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
import {transition} from '../../common';

import {DisplayName} from './@header';
import {Selectors} from './@selectors';
import {Tools} from './@tools';

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
  color: ${props => props.theme['text-primary']};
  background-color: ${props => props.theme.background};
  border-bottom: 1px solid ${props => props.theme.border};
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
  box-shadow: 0 2px 4px ${props => props.theme.shadow};
  background-color: #fff;

  .tools {
    opacity: 0;
    pointer-events: none;

    ${transition(['opacity'])}
  }

  &.active {
    box-shadow: 0 6px 12px ${props => props.theme['shadow-solid']};

    ${Header} {
      color: ${props => props.theme['text-primary-inverse']};
      background-color: ${props => props.theme.primary};
    }
  }

  &:hover {
    ${Header}:hover {
      color: ${props => props.theme['text-primary-inverse']};
      background-color: ${props => props.theme.secondary};
    }

    .tools {
      opacity: 1;
      pointer-events: unset;
    }
  }

  &.stateful {
    .tools {
      opacity: 0;
      pointer-events: none;
    }

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

    &.selected {
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

  const onNodeChange = (node: NodeMetadata): void =>
    void editor.procedure.updateNode(node);

  const onContainerClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (!statefulNode) {
      return;
    }

    if (statefulNode.type === 'connecting') {
      void editor.procedure.connectNode(statefulNode.trunk, nodeRef);
      return;
    }

    if (statefulNode.type === 'join') {
      editor.setStatefulNode({
        ...statefulNode,
        otherTrunks: [...(statefulNode.otherTrunks || []), nodeRef],
      });
      event.stopPropagation();
    }
  };

  let statefulNode = editor.statefulTrunk;

  return (
    <Container style={style}>
      {before && createElement(before, {node})}
      <Wrapper
        className={classnames([
          className,
          {
            stateful: !!statefulNode,
            selected: statefulNode?.trunk?.id === node.id,
          },
        ])}
        onClick={onContainerClick}
      >
        <Tools className="tools" prev={prev} node={nodeRef} />
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
        <Footer>
          <Selectors prev={prev} trunk={nodeRef} />
          {footer && createElement(footer, {node})}
        </Footer>
      </Wrapper>
      {after && createElement(after, {node})}
      {children}
    </Container>
  );
};
