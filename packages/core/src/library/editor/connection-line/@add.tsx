import {PlusCircleSolid as _PlusCircleSolid} from '@magicflow/icons';
import {Bezier as _Bezier, BezierStroke, Mark} from 'rc-bezier';
import React, {FC, useCallback, useContext, useState} from 'react';
import styled from 'styled-components';

import {transition} from '../../components';
import {ProcedureEdge} from '../../core';
import {EditorContext} from '../context';

const MarkWrapper = styled.div`
  position: relative;
  display: flex;
  font-size: 24px;
  cursor: pointer;

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

const AddMark: FC<{active: boolean; edge: ProcedureEdge}> = ({
  active,
  edge,
}) => {
  const {procedure} = useContext(EditorContext);

  const onClick = useCallback(() => {
    procedure.addNode(edge);
  }, [edge, procedure]);

  if (!active) {
    return <></>;
  }

  return (
    <MarkWrapper onClick={onClick}>
      <PlusCircleSolid />
    </MarkWrapper>
  );
};

export function useAddMark(
  edge: ProcedureEdge,
): [BezierStroke | undefined, Mark] {
  const [stroke, setStroke] = useState<BezierStroke | undefined>();

  const onMouseEnter = useCallback(() => {
    setStroke({
      width: 2,
      color: '#000',
    });
  }, [edge]);

  // const onMouseMove = useCallback(() => {}, [edge]);

  const onMouseLeave = useCallback(() => {
    setStroke(undefined);
  }, [edge]);

  return [
    stroke,
    {
      key: 'add',
      position: 0.5,
      render: <AddMark edge={edge} active={false} />,
      onMouseEnter,
      // onMouseMove,
      onMouseLeave,
    },
  ];
}
