import {Redo, Undo} from '@laughflow/icons';
import type {FC} from 'react';
import React, {useContext} from 'react';
import styled from 'styled-components';

import {IconButton} from '../@common';

import {FlowEditorContext} from './flow-editor';

export interface FooterProps {}

const Wrapper = styled.div`
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;

  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 2;
`;

const History = styled.div`
  position: absolute;
  left: 40px;
  bottom: 10px;
`;

export const Footer: FC<FooterProps> = React.memo(() => {
  const {editor} = useContext(FlowEditorContext);

  const onUndo = (): void => editor.undo();
  const onRedo = (): void => editor.redo();

  return (
    <Wrapper>
      <History>
        <IconButton
          tooltip={['撤销', '重做']}
          tooltipPlacement="top"
          disable={[!editor.undoStack.undoAble, !editor.undoStack.redoAble]}
        >
          <Undo onClick={onUndo} />
          <Redo onClick={onRedo} />
        </IconButton>
      </History>
    </Wrapper>
  );
});
