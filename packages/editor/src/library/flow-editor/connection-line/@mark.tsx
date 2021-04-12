import {NodeId} from '@magicflow/core';
import {AddSolid as _AddSolid, CombineSolid} from '@magicflow/icons';
import {Bezier as _Bezier, Mark} from 'rc-bezier';
import React, {FC, useContext, useState} from 'react';
import styled, {css} from 'styled-components';

import {transition} from '../../components';
import {EditorContext} from '../../context';

const Icon = css`
  opacity: 1;
  border-radius: 50%;
  background-color: #fff;

  &:hover {
    opacity: 0.8;
  }

  ${transition(['opacity'])}
`;

const AddSolid = styled(_AddSolid)`
  ${Icon};

  @keyframes single-node {
    0% {
      color: #296dff;
      transform: translateX(100%);
    }

    100% {
      color: #81cb5f;
      transform: translateX(0);
    }
  }

  color: #296dff;
`;

// const SingleNode = styled(AddSolid)`
//   @keyframes single-node {
//     0% {
//       color: #296dff;
//       transform: translateX(100%);
//     }

//     100% {
//       color: #81cb5f;
//       transform: translateX(0);
//     }
//   }

//   color: #81cb5f;
//   animation: single-node 0.2s linear alternate both;
// `;

const BranchesNode = styled(CombineSolid)`
  ${Icon};

  width: 0;
  opacity: 0;
  pointer-events: none;

  @keyframes branches-node {
    0% {
      color: #296dff;
      transform: translateX(-100%);
    }

    100% {
      opacity: 1;
      pointer-events: unset;
      color: #ffbb29;
      transform: translateX(0);
    }
  }

  color: #ffbb29;
`;

// const Paste = styled(Copy)`
//   font-size: 16px;
//   color: white;
//   background-color: #296dff;
//   border-radius: 50%;
//   padding: 4px;
// `;

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

    ${AddSolid} {
      animation: single-node 0.2s linear alternate both;
    }

    ${BranchesNode} {
      width: unset;
      animation: branches-node 0.2s linear alternate both;
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
  ${transition(['border-color'])}
`;

const Mark: FC<{
  start: NodeId;
  next: NodeId;
}> = ({}) => {
  const [toShowNodeType, setToShowNodeType] = useState(false);

  const {editor} = useContext(EditorContext);

  const onMouseEnter = (): void => {
    setToShowNodeType(true);
  };

  const onMouseLeave = (): void => {
    setToShowNodeType(false);
  };

  const onClick = (): void => {
    // if (editor.activeTrunk) {
    //   let editingTrunkRef = editor.activeTrunk.ref;
    //   if (editingTrunkRef.type !== 'node') {
    //     return;
    //   }
    //   switch (editor.activeTrunk.state) {
    //     case 'cutting':
    //       void editor.procedure.moveNode(
    //         editingTrunkRef.id,
    //         editor.activeTrunk.prev,
    //         node,
    //         targetNext,
    //       );
    //       break;
    //     case 'copying':
    //       void editor.procedure.copyNode(editingTrunkRef.id, node, targetNext);
    //       break;
    //     default:
    //       break;
    //   }
    // } else {
    //   void editor.procedure.createNode(
    //     node,
    //     migrateChildren ? 'next' : targetNext,
    //   );
    // }
  };

  let title = '插入节点';

  // if (editor.activeTrunk) {
  //   if (
  //     editor.activeTrunk.state === 'copying' ||
  //     editor.activeTrunk.state === 'cutting'
  //   ) {
  //     Icon = <Paste />;
  //     title = '粘贴';
  //   } else {
  //     Icon = <Paste />;
  //     title = '创建';
  //   }
  // }

  return (
    <MarkWrapper
      title={title}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* {toShowNodeType ? (
        <>
          <SingleNode />
          <BranchesNode />
        </>
      ) : (


      )} */}
      <AddSolid />
      <BranchesNode />
    </MarkWrapper>
  );
};

export function useMark(node: NodeId, next: NodeId): [Mark] {
  return [
    {
      key: 'mark',
      position: 0.5,
      render: <Mark start={node} next={next} />,
    },
  ];
}
