import React, {CSSProperties, FC, createElement, useContext} from 'react';
import styled from 'styled-components';

import {transition} from '../../components';
import {NodeMetadata} from '../../core';
import {EditorContext} from '../context';

import {DisplayName} from './@header';
import {Leaves} from './@leaves';

export interface NodeProps {
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
  margin: 0 16px;
  width: 220px;
  display: inline-block;
  vertical-align: top;
  border-radius: 4px;
  box-shadow: 0 2px 4px ${props => props.theme.shadow};
  background-color: #fff;

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
  }
`;

const Body = styled.div``;

const Footer = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
`;

export const Node: FC<NodeProps> = ({className, style, node, children}) => {
  const {procedure} = useContext(EditorContext);

  let {
    before,
    after,
    headLeft,
    headRight,
    footer,
    body,
  } = procedure.getNodeRenderDescriptor(node);

  const onNodeChange = (node: NodeMetadata): void => procedure.updateNode(node);

  return (
    <Container style={style}>
      {before && createElement(before, {node})}
      <Wrapper className={className}>
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
          <Leaves node={node.id} />
          {footer && createElement(footer, {node})}
        </Footer>
      </Wrapper>
      {after && createElement(after, {node})}
      {children}
    </Container>
  );
};
