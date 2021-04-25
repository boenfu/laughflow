import {AddSolid as _AddSolid, CombineSolid} from '@magicflow/icons';
import {NodeType, ProcedureFlow, ProcedureTreeNode} from '@magicflow/procedure';
import classNames from 'classnames';
import {Bezier as _Bezier} from 'rc-bezier';
import React, {FC, useContext} from 'react';
import styled from 'styled-components';

import {FlowContext} from '../flow-context';
import {
  createNode,
  createNodeAsFlowStart,
  createNodeBetweenNodes,
  pasteNode,
  pasteNodeAsFlowStart,
  pasteNodeBetweenNodes,
} from '../procedure-editor';

import {Icon} from './icon';

const PasteNode = styled(_AddSolid)`
  ${Icon};
  margin: 6px;
  color: red;
`;

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
  const {editor} = useContext(FlowContext);

  const onPasteSingleNode = (): void => {
    let activeInfo = editor.activeInfo;

    if (!activeInfo) {
      return;
    }

    if (start.type === 'flow') {
      editor.edit(
        pasteNodeAsFlowStart({
          activeInfo,
          flow: start.id,
          originStart: next?.id,
        }),
      );
    } else {
      let from = start.id;

      editor.edit(
        next
          ? pasteNodeBetweenNodes({
              activeInfo,
              from,
              to: next.id,
            })
          : pasteNode({activeInfo, from}),
      );
    }
  };

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
      let from = start.id;

      editor.edit(
        next
          ? createNodeBetweenNodes({
              type,
              from,
              to: next.id,
            })
          : createNode({type, from}),
      );
    }
  };

  const onCreateSingleNode = (): void => onCreateNode('singleNode');

  const onCreateBranchesNode = (): void => onCreateNode('branchesNode');

  let state = editor.activeInfo?.state;

  if (state === 'connect') {
    return <></>;
  }

  return (
    <MarkWrapper className={classNames({active})}>
      {state ? (
        <PasteNode onClick={onPasteSingleNode} />
      ) : (
        <>
          <SingleNode onClick={onCreateSingleNode} />
          <BranchesNode onClick={onCreateBranchesNode} />
        </>
      )}
    </MarkWrapper>
  );
};
