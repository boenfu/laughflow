import {SingleNode} from '@magicflow/procedure';
import React, {FC} from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  height: 100%;
  align-items: center;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: break-spaces;

  &:not(:first-child) {
    justify-content: flex-end;
  }

  &:not(:last-child) {
    justify-content: flex-start;
  }

  &:first-child:last-child,
  &:not(:first-child):not(:last-child) {
    justify-content: center;
  }
`;

const DisplayNameInput = styled.div`
  max-width: 82%;
  outline: none;
  background: transparent;
  font-size: 14px;

  &:before {
    font-size: 14px;
  }

  &:empty:before {
    content: '节点名称';
    opacity: 1;
  }

  &:not(:empty):before {
    content: none;
  }
`;

export interface DisplayNameProps {
  node: SingleNode;
}

export const DisplayName: FC<DisplayNameProps> = ({node}) => {
  return (
    <Wrapper>
      <DisplayNameInput>{node.displayName}</DisplayNameInput>
    </Wrapper>
  );
};
