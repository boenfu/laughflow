import {NodeType} from '@magicflow/core';
import {AddSolid as _AddSolid, CombineSolid} from '@magicflow/icons';
import {ProcedureFlow, ProcedureTreeNode} from '@magicflow/procedure';
import {Bezier as _Bezier, Mark} from 'rc-bezier';
import React, {FC, useContext} from 'react';
import styled, {css} from 'styled-components';

import {transition} from '../../components';
import {EditorContext} from '../../context';
import {
  createNodeAsFlowStart,
  createNodeBetweenNodes,
} from '../../procedure-editor';

const Icon = css`
  opacity: 1;
  border-radius: 50%;
  background-color: #fff;
  color: #296dff;
  margin: 6px;

  &:hover {
    opacity: 0.8;
  }

  ${transition(['opacity'])}
`;

const SingleNode = styled(_AddSolid)`
  ${Icon};
`;

const BranchesNode = styled(CombineSolid)`
  ${Icon};

  display: none;
`;

const MarkWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  font-size: 16px;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid transparent;

  &:hover {
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

  animation: mark-transform 0.2s 0.2s linear both;
`;

const Mark: FC<{
  start: ProcedureFlow | ProcedureTreeNode;
  next: ProcedureTreeNode;
}> = ({start, next}) => {
  const {editor} = useContext(EditorContext);

  const onCreateNode = (type: NodeType): void => {
    if (start.type === 'flow') {
      editor.edit(
        createNodeAsFlowStart({
          type,
          flow: start.id,
          originStart: next.id,
        }),
      );
    } else {
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

  const onCreateBranchesNode = (): void => onCreateNode('singleNode');

  let title = '插入节点';

  return (
    <MarkWrapper title={title}>
      <SingleNode onClick={onCreateSingleNode} />
      <BranchesNode onClick={onCreateBranchesNode} />
    </MarkWrapper>
  );
};

export function useMark(
  start: ProcedureFlow | ProcedureTreeNode,
  next: ProcedureTreeNode,
): [Mark] {
  return [
    {
      key: 'mark',
      position: 0.5,
      render: <Mark start={start} next={next} />,
    },
  ];
}
