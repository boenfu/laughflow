import React, {CSSProperties, FC, ReactNode} from 'react';
import styled from 'styled-components';

import {transition} from '../../components';
import {NodeMetadata} from '../../core';

import {Leaves} from './@leaves';

export interface NodeProps {
  node: NodeMetadata;
  className?: string;
  style?: CSSProperties;
  beforeRender?: ReactNode | (() => ReactNode);
  afterRender?: ReactNode | (() => ReactNode);
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
  align-items: center;
  font-size: 14px;
  color: ${props => props.theme['text-primary']};
  background-color: ${props => props.theme.background};
  border-bottom: 1px solid ${props => props.theme.border};
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;

  ${transition(['background-color', 'color'])}
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

const NameText = styled.span`
  flex: 1;
  text-align: center;
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
  node,
  beforeRender,
  afterRender,
  children,
}) => {
  return (
    <Container style={style}>
      {beforeRender}
      <Wrapper className={className}>
        <Header>
          <NameText>{node?.displayName}</NameText>
        </Header>
        <Body />
        <Footer>
          <Leaves node={node.id} />
        </Footer>
      </Wrapper>
      {afterRender}
      {children}
    </Container>
  );
};
