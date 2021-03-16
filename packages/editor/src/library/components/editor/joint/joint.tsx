import {JointMetadata, TrunkRef} from '@magicflow/core';
import {Trash} from '@magicflow/icons';
import React, {CSSProperties, FC, useContext} from 'react';
import styled from 'styled-components';

import {EditorContext} from '../../../context';
import {TooltipActions} from '../../common';

export interface JointProps {
  prev: TrunkRef;
  joint: JointMetadata;
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
  width: 48px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 12px;

  background: #ffbb29;

  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.08);
  border-radius: 28px;
`;

export const Joint: FC<JointProps> = ({className, style, joint, children}) => {
  const {editor} = useContext(EditorContext);

  let index =
    editor.procedure.definition.joints.findIndex(({id}) => id === joint.id) + 1;

  const onDisconnectNode = (): void => {};

  return (
    <Container style={style}>
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
        <Content className={className}>{index}</Content>
      </TooltipActions>
      {children}
    </Container>
  );
};
