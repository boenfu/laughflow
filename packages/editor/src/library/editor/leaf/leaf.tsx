import {LeafMetadata, TrunkRef} from '@magicflow/core';
import {Trash} from '@magicflow/icons';
import React, {FC, createElement, useContext} from 'react';
import styled from 'styled-components';

import {TooltipActions, transition} from '../../components';
import {EditorContext} from '../../context';

import {DoneLeaf} from './@done';
import {TerminateLeaf} from './@terminate';

export interface LeafProps {
  prev: TrunkRef;
  leaf: LeafMetadata;
}

const Wrapper = styled.div`
  margin: 0 16px;
  display: inline-block;
  text-align: center;
  vertical-align: top;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  ${transition(['opacity'])}
`;

const LeafContent = styled.div`
  display: inline-flex;
`;

const LeafTypeToRender = {
  done: DoneLeaf,
  terminate: TerminateLeaf,
};

export const Leaf: FC<LeafProps> = ({prev, leaf}) => {
  const {editor} = useContext(EditorContext);

  let Component = LeafTypeToRender[leaf.type];

  if (!Component) {
    return <></>;
  }

  const onDelete = (): void => void editor.procedure.deleteLeaf(prev, leaf.id);

  return (
    <Wrapper>
      <TooltipActions
        actions={[
          {
            name: 'delete',
            icon: <Trash />,
            content: '删除',
            onAction: onDelete,
          },
        ]}
      >
        <LeafContent>{createElement(Component, {leaf})}</LeafContent>
      </TooltipActions>
    </Wrapper>
  );
};
