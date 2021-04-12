import {NodeType} from '@magicflow/core';
import {AddSolid as _AddSolid, CombineSolid} from '@magicflow/icons';
import {ProcedureFlow, ProcedureTreeNode} from '@magicflow/procedure';
import classNames from 'classnames';
import {Bezier as _Bezier} from 'rc-bezier';
import React, {FC, useContext} from 'react';
import styled from 'styled-components';

import {EditorContext} from '../../context';
import {
  createNodeAsFlowStart,
  createNodeBetweenNodes,
} from '../../procedure-editor';
import {Icon} from '../common';

const SingleNode = styled(_AddSolid)`
  ${Icon};
  margin: 6px;
`;

const BranchesNode = styled(CombineSolid)`
  ${Icon};
  margin: 6px;

  display: none;
`;

const MarkWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 8px;
  border: 1px solid transparent;

  &:hover,
  &.active {
    border-color: #c8cdd8;

    ${SingleNode} {
      color: #81cb5f;
    }

    ${BranchesNode} {
      display: unset;
      color: #ffbb29;
    }
  }

  @keyframes mark-transform {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

  animation: mark-transform 0.2s linear both;
`;

interface MarkProps {
  start: ProcedureFlow | ProcedureTreeNode;
  next?: ProcedureTreeNode;
  active?: boolean;
}

export const Mark: FC<MarkProps> = ({start, next, active}) => {
  const {editor} = useContext(EditorContext);

  const onCreateNode = (type: NodeType): void => {
    if (start.type === 'flow') {
      editor.edit(
        createNodeAsFlowStart({
          type,
          flow: start.id,
          originStart: next?.id,
        }),
      );
    } else {
      if (!next) {
        return;
      }

      editor.edit(
        createNodeBetweenNodes({
          type,
          from: start.id,
          to: next.id,
        }),
      );
    }
  };

  const onCreateSingleNode = (): void => onCreateNode('singleNode');

  const onCreateBranchesNode = (): void => onCreateNode('branchesNode');

  let title = '插入节点';

  return (
    <MarkWrapper title={title} className={classNames({active})}>
      <SingleNode onClick={onCreateSingleNode} />
      <BranchesNode onClick={onCreateBranchesNode} />
    </MarkWrapper>
  );
};
