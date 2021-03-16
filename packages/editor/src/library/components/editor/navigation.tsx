import {Expand, Redo, Undo} from '@magicflow/icons';
import React, {FC, useContext} from 'react';
import styled from 'styled-components';

import {EditorContext} from '../../context';

export interface NavigationProps {
  onFullScreenToggle(): void;
}

const Wrapper = styled.div`
  position: sticky;
  height: 56px;
  top: 0;
  left: 0;
  margin: 0 -40px 24px;

  display: flex;
  align-items: center;
`;

const Left = styled.div``;

const Mid = styled.div`
  flex: 1;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
`;

const Button = styled.div`
  opacity: 0.8;
  height: 26px;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  cursor: pointer;
`;

const SplitLine = styled.div`
  width: 1px;
  background-color: #c2c5cd;
  height: 18px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  padding: 2px;
  background: #d8dade;
  box-shadow: 0px 2px 4px rgba(185, 188, 196, 0.77);
  border-radius: 4px;
  align-items: center;

  & + & {
    margin-left: 8px;
  }
`;

export const Navigation: FC<NavigationProps> = ({onFullScreenToggle}) => {
  const {editor} = useContext(EditorContext);

  const onUndo = (): void => editor.procedure.undo();
  const onRedo = (): void => editor.procedure.redo();

  return (
    <Wrapper>
      <Left />
      <Mid />
      <Right>
        <ButtonWrapper>
          <Button>
            <Undo onClick={onUndo} />
          </Button>
          <SplitLine />
          <Button>
            <Redo onClick={onRedo} />
          </Button>
        </ButtonWrapper>
        <ButtonWrapper onClick={onFullScreenToggle}>
          <Button>
            <Expand />
          </Button>
        </ButtonWrapper>
      </Right>
    </Wrapper>
  );
};
