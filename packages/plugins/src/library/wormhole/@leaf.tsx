import {EditorContext, LeafMetadata} from '@magicflow/core';
import React, {FC, useContext} from 'react';
import styled from 'styled-components';

import {getNodeDisplayName} from './@utils';

export interface WormholeLeafProps {
  leaf: LeafMetadata;
}

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

export const WormholeLeaf: FC<WormholeLeafProps> = ({leaf}) => {
  const {procedure} = useContext(EditorContext);

  let node = procedure.definition.nodes.find(node => node.id === leaf.target);

  return (
    <Content className={leaf.type}>
      {node ? getNodeDisplayName(node) : '-'}
    </Content>
  );
};
