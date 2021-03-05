import {LeafMetadata} from '@magicflow/core';
import {Trash} from '@magicflow/icons';
import React, {FC, createElement, useContext} from 'react';
import styled from 'styled-components';

import {EditorContext} from '../../../context';
import {TooltipActions, transition} from '../../common';

export interface LeafProps {
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

export const Leaf: FC<LeafProps> = ({leaf}) => {
  const {editor} = useContext(EditorContext);

  let renderDescriptor = editor.getLeafRenderDescriptor(leaf.type);

  if (!renderDescriptor) {
    return <></>;
  }

  const onDelete = (): void => void editor.procedure.deleteLeaf(leaf.id);

  let {render: Component} = renderDescriptor;

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
