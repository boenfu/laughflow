import React, {FC, useContext} from 'react';
import styled from 'styled-components';

import {EditorContext, LeafPluginComponentProps} from '@magicflow/editor';

import {getNodeDisplayName} from './@utils';

const Content = styled.div`
  width: 64px;
  height: 32px;
  font-size: 12px;
  line-height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 28px;
  box-shadow: 0 2px 4px ${props => props.theme.shadow};
  overflow: hidden;
  color: ${props => props.theme['text-primary']};
  background-color: #fff;
`;

export const WormholeLeaf: FC<LeafPluginComponentProps> = ({leaf}) => {
  const {procedure} = useContext(EditorContext);

  let node = procedure.definition.nodes.find(node => node.id === leaf.target);

  return (
    <Content className={leaf.type}>
      {node ? getNodeDisplayName(node) : '-'}
    </Content>
  );
};
