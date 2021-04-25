import {Trash} from '@magicflow/icons';
import {ProcedureTreeNode} from '@magicflow/procedure';
import React, {CSSProperties, FC, useContext} from 'react';
import styled from 'styled-components';

import {transition} from '../../@common';
import {FlowContext} from '../../flow-context';
import {deleteLinkNode} from '../../procedure-editor';

export interface LinkNodeProps {
  node: ProcedureTreeNode;
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

  &,
  * {
    pointer-events: all !important;
  }
`;

const TrashWrapper = styled.div`
  opacity: 0;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #296dff;
  font-size: 16px;
  color: #fff;
  cursor: pointer;

  ${transition(['opacity'])}
`;

const Content = styled.div`
  position: relative;
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

  &:hover {
    ${TrashWrapper} {
      opacity: 1;
    }
  }
`;

export const LinkNode: FC<LinkNodeProps> = ({className, style, node}) => {
  const {editor} = useContext(FlowContext);

  const onDelete = (): void => editor.edit(deleteLinkNode(node));

  return (
    <Container style={style}>
      <Content className={className}>
        {(node.type === 'singleNode' && node.definition.displayName) || '-'}
        <TrashWrapper onClick={onDelete}>
          <Trash />
        </TrashWrapper>
      </Content>
    </Container>
  );
};
