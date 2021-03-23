import {Redo, Undo} from '@magicflow/icons';
import React, {FC, useContext} from 'react';
import styled from 'styled-components';

import {IconButton} from '../components/common';
import {EditorContext} from '../context';

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

const Button = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 144px;
  height: 44px;
  font-size: 16px;
  color: #fff;
  background: #c2c7d3;
  border-radius: 4px;

  cursor: pointer;

  &.primary {
    background: #296dff;
  }
`;

export const Footer: FC<FooterProps> = React.memo(() => {
  const {editor} = useContext(EditorContext);

  let activeTrunk = editor.activeTrunk;
  let relationTrunksLength = activeTrunk?.relationTrunks?.length;

  const onUndo = (): void => editor.procedure.undo();
  const onRedo = (): void => editor.procedure.redo();

  const onCancelJoin = (): void => {
    editor.setActiveTrunk(undefined);
  };

  const onCreateJoint = (): void => {
    if (!activeTrunk) {
      return;
    }

    void editor.procedure.createJoint(
      activeTrunk.ref,
      activeTrunk?.relationTrunks || [],
    );

    editor.setActiveTrunk(undefined);
  };

  return (
    <Wrapper>
      <History>
        <IconButton
          tooltip={['撤销', '重做']}
          disable={[!editor.procedure.undoAble, !editor.procedure.redoAble]}
        >
          <Undo onClick={onUndo} />
          <Redo onClick={onRedo} />
        </IconButton>
      </History>

      {activeTrunk?.state === 'joining' ? (
        <>
          <Button onClick={onCancelJoin}>取消</Button>
          <Button
            {...(relationTrunksLength
              ? {
                  className: 'primary',

                  onClick: onCreateJoint,
                }
              : {})}
            style={{
              marginLeft: 20,
            }}
          >
            连接节点
          </Button>
        </>
      ) : undefined}
    </Wrapper>
  );
});
