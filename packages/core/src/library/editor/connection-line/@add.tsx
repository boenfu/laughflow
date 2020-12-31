import {PlusCircleSolid as _PlusCircleSolid} from '@magicflow/icons';
import {Bezier as _Bezier, BezierPoint, Mark} from 'rc-bezier';
import React, {
  FC,
  MouseEventHandler,
  useCallback,
  useContext,
  useReducer,
  useState,
} from 'react';
import styled from 'styled-components';

import {transition} from '../../components';
import {ProcedureEdge} from '../../core';
import {EditorContext} from '../context';

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

const AddMark: FC<{
  active: boolean;
  edge: ProcedureEdge;
  onMouseEnter: MouseEventHandler;
  onMouseLeave: MouseEventHandler;
}> = ({active, edge, onMouseEnter, onMouseLeave}) => {
  const {procedure} = useContext(EditorContext);

  const onClick = useCallback(() => {
    procedure.addNode(edge);
  }, [edge, procedure]);

  if (!active) {
    return <></>;
  }

  return (
    <MarkWrapper
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <PlusCircleSolid />
    </MarkWrapper>
  );
};

export function useAddMark(edge: ProcedureEdge): [Mark] {
  const [position, setPosition] = useState<BezierPoint | undefined>(undefined);

  const [active, dispatch] = useReducer((active: number, action: number) => {
    return active + action;
  }, 0);

  const onMouseEnter = useCallback(
    point => {
      dispatch(1);
      setPosition(point);
    },
    [dispatch],
  );

  const onMouseMove = useCallback(point => {
    setPosition(point);
  }, []);

  const onMouseLeave = useCallback(
    point => {
      setPosition(point);
      dispatch(-1);
    },
    [dispatch],
  );

  const onMarkEnter = useCallback(() => {
    dispatch(1);
  }, [dispatch]);

  const onMarkLeave = useCallback(() => {
    dispatch(-1);
  }, [dispatch]);

  return [
    {
      key: 'add',
      position,
      render: (
        <AddMark
          edge={edge}
          active={!!(active > 0 && position)}
          onMouseEnter={onMarkEnter}
          onMouseLeave={onMarkLeave}
        />
      ),
      onMouseEnter,
      onMouseMove,
      onMouseLeave,
    },
  ];
}
