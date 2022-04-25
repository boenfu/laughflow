import {Plus} from '@laughflow/icons';
import React, {FC} from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  font-size: 0.9em;
  line-height: 18px;

  color: #333333;
  cursor: pointer;
`;

const AddIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 0.8em;
  background-color: #e7efff;
  color: #0348dd;
  border-radius: 50%;
  margin-right: 10px;
`;

interface AddButtonProps {
  onClick(): void;
}

export const AddButton: FC<AddButtonProps> = ({children, onClick}) => {
  return (
    <Wrapper className="add" onClick={onClick}>
      <AddIcon>
        <Plus />
      </AddIcon>
      {children}
    </Wrapper>
  );
};
