import {TimesSolid} from '@magicflow/icons';
import React, {FC} from 'react';
import styled from 'styled-components';

export interface TerminateLeafProps {}

const Content = styled.div`
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  box-shadow: 0 2px 4px ${props => props.theme.shadow};
  overflow: hidden;
  background-color: #e55a3a;
`;

export const TerminateLeaf: FC<TerminateLeafProps> = () => {
  return (
    <Content>
      <TimesSolid />
    </Content>
  );
};
