import {LeafMetadata, LeafType, NodeId} from '@magicflow/core';
import {
  ConnectNode,
  More,
  PlusCircleSolid as _PlusCircleSolid,
} from '@magicflow/icons';
import {useBoolean} from 'ahooks';
import React, {
  FC,
  MouseEvent,
  createElement,
  useCallback,
  useContext,
} from 'react';
import styled from 'styled-components';

import {EditorContext} from '../../../context';
import {MenuPopup, transition} from '../../common';

export interface SelectorsProps {
  prev: NodeId | undefined;
  node: NodeId;
}

const MoreButton = styled(More)`
  font-size: 18px;
  flex: none;
  opacity: 1;
  transform: translate(0, 0);
  cursor: pointer;

  ${transition(['transform', 'opacity'])}
`;

const Menus = styled(MenuPopup)`
  font-size: 24px;
  padding: 2px 10px;

  opacity: 0;
  pointer-events: none;
  transform: translate(0, 28px);
  ${transition(['transform', 'opacity'])}
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
  display: flex;
  align-items: center;
  width: 18px;
  height: 18px;
  overflow: visible;
  padding-left: 14px;

  &:hover {
    ${MoreButton} {
      opacity: 0;
      transform: translate(-32px, 0);
    }

    ${Menus} {
      opacity: 1;
      pointer-events: unset;
      transform: translate(-42px, 0);
    }
  }
`;

const PlusCircleSolid = styled(_PlusCircleSolid)`
  color: #9ba0ab;
`;

export const Selectors: FC<SelectorsProps> = ({prev, node}) => {
  const [initialized, {setTrue}] = useBoolean(false);

  const {editor} = useContext(EditorContext);

  const getOnCreateLeaf = useCallback(
    (type: string) => {
      return () => editor.procedure.createLeaf(node, type as LeafType);
    },
    [editor, node],
  );

  const onCreateNode = (): void => void editor.procedure.createNode(node);

  const onConnectNode = (event: MouseEvent): void => {
    editor.setStatefulNode({prev, node, type: 'connecting'});
    event.stopPropagation();
  };

  const onConnectJoint = (event: MouseEvent): void => {
    editor.setStatefulNode({prev, node, type: 'join'});
    event.stopPropagation();
  };

  // let leaves = editor.procedure.getNodeLeaves(node);
  let leaves: any[] = [];

  let leavesMap = new Map<string, LeafMetadata>(
    leaves.map(leaf => [leaf.type, leaf]),
  );

  return (
    <Wrapper onMouseOverCapture={setTrue}>
      <MoreButton />
      <Menus>
        {[...(initialized ? editor.getLeafRenderDescriptors() : [])].map(
          ({type, selector: {multiple, render}}) => {
            return (
              <MenuItem
                key={type}
                {...(leavesMap.has(type) && !multiple
                  ? {
                      className: 'disabled',
                    }
                  : {
                      onClick: getOnCreateLeaf(type),
                    })}
              >
                {createElement(render)}
              </MenuItem>
            );
          },
        )}

        <MenuItem onClick={onConnectJoint}>
          <ConnectNode />
        </MenuItem>

        <MenuItem onClick={onConnectNode}>
          <ConnectNode />
        </MenuItem>

        <MenuItem onClick={onCreateNode}>
          <PlusCircleSolid />
        </MenuItem>
      </Menus>
    </Wrapper>
  );
};
