import {
  CheckCircleSolid,
  More,
  PlusCircleSolid as _PlusCircleSolid,
  TimesCircleSolid,
} from '@magicflow/icons';
import React, {FC, useCallback, useContext} from 'react';
import styled from 'styled-components';

import {MenuPopup, transition} from '../../components';
import {LeafType, NodeId} from '../../core';
import {EditorContext} from '../context';

export interface LeavesProps {
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

export const Leaves: FC<LeavesProps> = ({node}) => {
  const {procedure} = useContext(EditorContext);

  const getOnCreateLeaf = useCallback(
    (type: LeafType) => {
      return () => procedure.addLeaf(node, type);
    },
    [procedure, node],
  );

  const onCreateNode = useCallback(() => {
    procedure.addNode(node);
  }, [procedure, node]);

  const leaves = procedure.getNodeLeaves(node);

  const leavesMap = new Map(leaves.map(leaf => [leaf.type, leaf]));

  return (
    <Wrapper>
      <MoreButton />
      <Menus>
        <CheckCircleSolid
          {...(leavesMap.has('done')
            ? {
                className: 'disabled',
              }
            : {
                onClick: getOnCreateLeaf('done'),
              })}
        />
        <TimesCircleSolid
          {...(leavesMap.has('terminate')
            ? {
                className: 'disabled',
              }
            : {
                onClick: getOnCreateLeaf('terminate'),
              })}
        />
        <PlusCircleSolid onClick={onCreateNode} />
      </Menus>
    </Wrapper>
  );
};
