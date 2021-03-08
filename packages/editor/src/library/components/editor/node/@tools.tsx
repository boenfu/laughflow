import {NodeId, NodeMetadata} from '@magicflow/core';
import {
  Copy,
  Cut,
  PlusCircleSolid as _PlusCircleSolid,
  Trash,
} from '@magicflow/icons';
import React, {FC, MouseEvent, useContext} from 'react';
import styled from 'styled-components';

import {EditorContext} from '../../../context';
import {MenuPopup, transition} from '../../common';

export interface ToolsProps {
  className?: string;
  prev: NodeId | undefined;
  node: NodeMetadata;
}

const Menus = styled(MenuPopup)`
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
  display: flex;
  align-items: center;
  justify-content: center;
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
  right: -12px;
  top: -12px;
  display: flex;
  align-items: center;
`;

export const Tools: FC<ToolsProps> = ({className, prev, node}) => {
  const {editor} = useContext(EditorContext);

  const onCutNode = (event: MouseEvent): void => {
    editor.setStatefulNode({prev, node: node.id, type: 'cutting'});
    event.stopPropagation();
  };

  const onCopyNode = (event: MouseEvent): void => {
    editor.setStatefulNode({prev, node: node.id, type: 'copying'});
    event.stopPropagation();
  };

  const onDeleteNode = (): void => {
    void editor.procedure.deleteNode(node.id, prev);
  };

  return (
    <Wrapper className={className}>
      <Menus>
        <MenuItem title="剪切" onClick={onCutNode}>
          <Cut />
        </MenuItem>
        <MenuItem title="复制" onClick={onCopyNode}>
          <Copy />
        </MenuItem>
        <MenuItem title="删除" onClick={onDeleteNode}>
          <Trash />
        </MenuItem>
      </Menus>
    </Wrapper>
  );
};
