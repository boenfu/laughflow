import {Ref, TrunkRef} from '@magicflow/core';
import {AddSolid as _AddSolid, Copy} from '@magicflow/icons';
import {Bezier as _Bezier, BezierPoint, Mark} from 'rc-bezier';
import React, {
  FC,
  MouseEventHandler,
  useContext,
  useReducer,
  useState,
} from 'react';
import styled from 'styled-components';

import {EditorContext} from '../../../context';
import {transition} from '../../common';

import {LINE_HEIGHT_DEFAULT} from './connection-line';

const MarkWrapper = styled.div`
  position: relative;
  display: flex;
  font-size: 24px;
  cursor: pointer;

  @keyframes mark-transform {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

  animation: mark-transform 0.2s 0.2s linear both;

  &::after {
    position: absolute;
    left: 4px;
    top: 4px;

    content: '';
    width: 16px;
    height: 16px;
    background-color: #fff;
    border-radius: 50%;
    z-index: -1;
  }
`;

const AddSolid = styled(_AddSolid)`
  opacity: 1;
  color: #296dff;

  &:hover {
    opacity: 0.8;
  }

  ${transition(['opacity'])}
`;

const Paste = styled(Copy)`
  font-size: 16px;
  color: white;
  background-color: #296dff;
  border-radius: 50%;
  padding: 4px;
`;

const Mark: FC<{
  active: boolean;
  start: TrunkRef;
  next: Ref;
  position: BezierPoint | undefined;
  onMouseEnter: MouseEventHandler;
  onMouseLeave: MouseEventHandler;
}> = ({active, start: node, next, position, onMouseEnter, onMouseLeave}) => {
  const {editor} = useContext(EditorContext);
  const migrateChildren = position && position.y < LINE_HEIGHT_DEFAULT;

  const onClick = (): void => {
    let targetNext =
      next.type !== 'leaf' || next.id !== 'placeholder' ? next : undefined;

    if (editor.activeTrunk) {
      let editingTrunkRef = editor.activeTrunk.ref;

      if (editingTrunkRef.type !== 'node') {
        return;
      }

      switch (editor.activeTrunk.state) {
        case 'cutting':
          void editor.procedure.moveNode(
            editingTrunkRef.id,
            editor.activeTrunk.prev,
            node,
            targetNext,
          );

          break;

        case 'copying':
          void editor.procedure.copyNode(editingTrunkRef.id, node, targetNext);
          break;

        default:
          break;
      }
    } else {
      void editor.procedure.createNode(
        node,
        migrateChildren ? 'next' : targetNext,
      );
    }
  };

  if (!active) {
    return <></>;
  }

  let Icon = <AddSolid />;
  let title = '插入节点';

  if (editor.activeTrunk) {
    if (
      editor.activeTrunk.state === 'copying' ||
      editor.activeTrunk.state === 'cutting'
    ) {
      Icon = <Paste />;
      title = '粘贴';
    } else {
      Icon = <Paste />;
      title = '创建';
    }
  }

  return (
    <MarkWrapper
      title={title}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {Icon}
    </MarkWrapper>
  );
};

export function useMark(trunk: TrunkRef, next: Ref): [Mark] {
  const [position, setPosition] = useState<BezierPoint | undefined>(undefined);

  const [active, dispatch] = useReducer(
    (active: number, action: number) => active + action,
    0,
  );

  const onMouseEnter = (): void => dispatch(1);
  const onMouseMove = (point: BezierPoint): void => setPosition(point);
  const onMouseLeave = (): void => dispatch(-1);

  return [
    {
      key: 'mark',
      position,
      render: (
        <Mark
          start={trunk}
          next={next}
          position={position}
          active={!!(active > 0 && position)}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      ),
      onMouseEnter,
      onMouseMove,
      onMouseLeave,
    },
  ];
}
