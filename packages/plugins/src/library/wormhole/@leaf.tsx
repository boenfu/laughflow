import {LeafMetadata} from '@magicflow/core';
import React, {FC} from 'react';
import styled from 'styled-components';

export interface WormholeLeafProps {
  leaf: LeafMetadata;
}

const Content = styled.div`
  width: 64px;
  height: 32px;
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
  return <Content className={leaf.type}>虫洞</Content>;
};
