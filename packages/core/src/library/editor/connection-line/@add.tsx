import {PlusCircleSolid as _PlusCircleSolid} from '@magicflow/icons';
import {Bezier as _Bezier, Mark} from 'rc-bezier';
import React, {FC, useCallback, useContext} from 'react';
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
  color: ${props => props.theme.primary};

  filter: brightness(0.95);

  &:hover {
    filter: brightness(1.05);
  }

  ${transition(['filter'])}
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

export function useAddMark(edge: ProcedureEdge): [Mark] {
  return [
    {
      key: 'add',
      position: 0.5,
      render: <AddMark edge={edge} active={false} />,
    },
  ];
}
