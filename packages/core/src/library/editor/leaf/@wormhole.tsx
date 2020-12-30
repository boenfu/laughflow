import React, {FC} from 'react';
import styled from 'styled-components';

import {LeafMetadata} from '../../core';

export interface WormholeLeafProps {
  leaf: LeafMetadata;
}

const Content = styled.div`
  width: 64px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 28px;
  color: #fff;
  box-shadow: 0 2px 4px ${props => props.theme.shadow};
  overflow: hidden;
  background-color: #fff;
`;

export const WormholeLeaf: FC<WormholeLeafProps> = ({leaf}) => {
  return <Content className={leaf.type}>虫洞</Content>;
};
