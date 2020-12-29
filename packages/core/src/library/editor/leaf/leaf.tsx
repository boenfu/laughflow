import {CheckSolid, TimesSolid} from '@magicflow/icons';
import React, {FC} from 'react';
import styled from 'styled-components';

import {MenuPopup} from '../../components';
import {LeafMetadata, LeafType} from '../../core';

export interface LeafProps {
  leaf: LeafMetadata;
}

const Wrapper = styled.div`
  width: 120px;
  display: inline-block;
  text-align: center;
  vertical-align: top;
`;

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

  &.done {
    background-color: #81cb5f;
  }

  &.terminated {
    background-color: #e55a3a;
  }
`;

const TYPE_ICON: Partial<{[key in LeafType]: JSX.Element}> = {
  done: <CheckSolid />,
  terminated: <TimesSolid />,
};

export const Leaf: FC<LeafProps> = ({leaf}) => {
  return (
    <Wrapper>
      <Content className={leaf.type}>
        {TYPE_ICON[leaf.type] || <MenuPopup>123213</MenuPopup>}
      </Content>
    </Wrapper>
  );
};
