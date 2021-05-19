import {Redo, Undo} from '@magicflow/icons';
import React, {FC} from 'react';
import styled from 'styled-components';

import {IconButton} from '../@common';

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
  const onUndo = (): void => {};
  const onRedo = (): void => {};

  return (
    <Wrapper>
      <History>
        <IconButton tooltip={['撤销', '重做']} tooltipPlacement="top">
          <Undo onClick={onUndo} />
          <Redo onClick={onRedo} />
        </IconButton>
      </History>
    </Wrapper>
  );
});
