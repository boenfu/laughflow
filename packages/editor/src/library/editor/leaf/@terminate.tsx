import {LeafMetadata} from '@magicflow/core';
import {Wrong} from '@magicflow/icons';
import React, {FC} from 'react';
import styled from 'styled-components';

export interface TerminateLeafProps {
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
  background-color: #e55a3a;
`;

export const TerminateLeaf: FC<TerminateLeafProps> = () => {
  return (
    <Content>
      <Wrong />
    </Content>
  );
};
