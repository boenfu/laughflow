import {LeafMetadata} from '@magicflow/core';
import {Check} from '@magicflow/icons';
import React, {FC} from 'react';
import styled from 'styled-components';

export interface DoneLeafProps {
  leaf: LeafMetadata;
}

const Content = styled.div`
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  background-color: #81cb5f;
`;

export const DoneLeaf: FC<DoneLeafProps> = () => {
  return (
    <Content>
      <Check />
    </Content>
  );
};
