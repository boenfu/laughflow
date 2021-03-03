import {NodeMetadata} from '@magicflow/core';
import {PlusCircleSolid as _PlusCircleSolid, Trash} from '@magicflow/icons';
import React, {FC, useContext} from 'react';
import styled from 'styled-components';

import {EditorContext} from '../../../context';
import {MenuPopup, transition} from '../../common';

export interface ToolsProps {
  node: NodeMetadata;
}

const Menus = styled(MenuPopup)`
  font-size: 24px;
  padding: 2px 10px;

  transform: translate(0, 2px);
  ${transition(['transform', 'opacity'])}

  svg {
    cursor: pointer;

    & + & {
      margin-left: 4px;
    }

    &:hover {
      transform: translateY(-2px);
      opacity: 0.8;
    }

    &.disabled {
      transform: translateY(0);
      opacity: 0.3;
    }

    ${transition(['transform', 'opacity'])}
  }
`;

const MenuItem = styled.div`
  width: 24px;
  height: 24px;
  overflow: hidden;
  cursor: pointer;

  & + & {
    margin-left: 4px;
  }

  &:hover {
    transform: translateY(-2px);
    opacity: 0.8;
  }

  &.disabled {
    transform: translateY(0);
    opacity: 0.3;
    pointer-events: none;
  }

  ${transition(['transform', 'opacity'])}
`;

const Wrapper = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  align-items: center;
  width: 18px;
  height: 18px;
  overflow: visible;
  padding-left: 14px;
`;

export const Tools: FC<ToolsProps> = ({node}) => {
  const {editor} = useContext(EditorContext);

  const onDeleteNode = (): void => {
    editor.procedure.deleteNode(node.id, true);
  };

  return (
    <Wrapper>
      <Menus>
        <MenuItem>
          <Trash onClick={onDeleteNode} />
        </MenuItem>
      </Menus>
    </Wrapper>
  );
};
