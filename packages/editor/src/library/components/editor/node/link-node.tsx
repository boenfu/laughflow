import {NodeMetadata} from '@magicflow/core';
import React, {CSSProperties, FC} from 'react';
import styled from 'styled-components';

export interface LinkNodeProps {
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

const Content = styled.div`
  width: 64px;
  height: 32px;
  font-size: 12px;
  line-height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 28px;
  box-shadow: 0 2px 4px ${props => props.theme.shadow};
  overflow: hidden;
  color: ${props => props.theme['text-primary']};
  background-color: #fff;
`;

export const LinkNode: FC<LinkNodeProps> = ({className, style, node}) => {
  // const {editor} = useContext(EditorContext);

  // const onNodeChange = (node: NodeMetadata): void =>
  //   editor.procedure.updateNode(node);

  return (
    <Container style={style}>
      <Content className={className}>{node?.displayName || '-'}</Content>
    </Container>
  );
};
