import {NextMetadata, NodeId} from '@magicflow/core';
import {Copy, PlusCircleSolid as _PlusCircleSolid} from '@magicflow/icons';
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

const PlusCircleSolid = styled(_PlusCircleSolid)`
  opacity: 1;
  color: ${props => props.theme.primary};

  &:hover {
    opacity: 0.8;
  }

  ${transition(['opacity'])}
`;

const Paste = styled(Copy)`
  font-size: 16px;
  color: white;
  background-color: ${props => props.theme.primary};
  border-radius: 50%;
  padding: 4px;
`;

const Mark: FC<{
  active: boolean;
  node: NodeId;
  next: NextMetadata;
  position: BezierPoint | undefined;
  onMouseEnter: MouseEventHandler;
  onMouseLeave: MouseEventHandler;
}> = ({active, node, next, position, onMouseEnter, onMouseLeave}) => {
  const {editor} = useContext(EditorContext);
  const migrateChildren = position && position.y < LINE_HEIGHT_DEFAULT / 2;

  const onClick = (): void => {
    if (editor.statefulNode) {
      switch (editor.statefulNode.type) {
        case 'cutting':
          void editor.procedure.moveNode(
            editor.statefulNode.node,
            editor.statefulNode.prev,
            node,
            next,
          );

          break;

        case 'copying':
          void editor.procedure.copyNode(editor.statefulNode.node, node, next);
          break;

        default:
          break;
      }
    } else {
      void editor.procedure.createNode(node, migrateChildren ? 'next' : next);
    }
  };

  if (!active) {
    return <></>;
  }

  let Icon = <PlusCircleSolid />;
  let title = '插入节点';

  if (editor.statefulNode && editor.statefulNode.type !== 'connecting') {
    Icon = <Paste />;
    title = '粘贴';
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

export function useMark(node: NodeId, next: NextMetadata): [Mark] {
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
          node={node}
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
