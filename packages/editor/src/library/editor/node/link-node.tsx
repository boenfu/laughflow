import {NodeMetadata, TrunkRef} from '@magicflow/core';
import {Trash} from '@magicflow/icons';
import React, {CSSProperties, FC, useContext} from 'react';
import styled from 'styled-components';

import {TooltipActions} from '../../components';
import {EditorContext} from '../../context';

export interface LinkNodeProps {
  prev: TrunkRef;
  node: NodeMetadata;
  className?: string;
  readOnly?: boolean;
  style?: CSSProperties;
}

const Container = styled.div`
  display: inline-block;
  text-align: center;
  white-space: nowrap;
  vertical-align: top;
  margin: 0 16px;
`;

const Content = styled.div`
  width: 64px;
  height: 32px;
  font-size: 12px;
  line-height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 28px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  color: #333333;
  background-color: #fff;
`;

export const LinkNode: FC<LinkNodeProps> = ({className, style, node, prev}) => {
  const {editor} = useContext(EditorContext);

  const onDisconnectNode = (): void =>
    void editor.procedure.disconnectNode(prev, {
      type: 'node',
      id: node.id,
    });

  return (
    <TooltipActions
      actions={[
        {
          name: 'delete',
          icon: <Trash />,
          content: '删除',
          onAction: onDisconnectNode,
        },
      ]}
    >
      <Container style={style}>
        <Content className={className}>{node?.displayName || '-'}</Content>
      </Container>
    </TooltipActions>
  );
};
