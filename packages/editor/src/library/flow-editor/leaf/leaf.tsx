import {Check} from '@magicflow/icons';
import React, {FC} from 'react';
import styled from 'styled-components';

import {transition} from '../../@common';

export interface LeafProps {}

const Wrapper = styled.div`
  margin: 0 16px;
  display: inline-block;
  text-align: center;
  vertical-align: top;
  cursor: pointer;
  pointer-events: all !important;

  &:hover {
    opacity: 0.8;
  }

  ${transition(['opacity'])}
`;

const Content = styled.div`
  font-size: 12px;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  background-color: #81cb5f;
`;

export const Leaf: FC<LeafProps> = ({}) => {
  return (
    <Wrapper>
      <Content>
        <Check />
      </Content>
    </Wrapper>
  );
};
