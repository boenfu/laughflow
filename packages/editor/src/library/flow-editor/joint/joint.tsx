import {JointMetadata, TrunkRef} from '@magicflow/core';
import React, {CSSProperties, FC, MouseEvent, useContext} from 'react';
import styled from 'styled-components';

import {transition} from '../../components';
import {EditorContext} from '../../context';
import {EditingContent} from '../@editing-content';

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

const Content = styled(EditingContent)`
  width: 48px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;

  color: #fff;
  background-color: #ffbb29;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.08);
  border-radius: 28px;

  ${transition(['opacity', 'background-color'])}

  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  &.active {
    background-color: #296dff;
  }
`;

export const Joint: FC<JointProps> = ({style, prev, joint, children}) => {
  const {editor} = useContext(EditorContext);

  let index =
    editor.procedure.definition.joints.findIndex(({id}) => id === joint.id) + 1;

  const onJointClick = (event: MouseEvent<HTMLDivElement>): void => {
    event.stopPropagation();

    editor.setActiveTrunk({
      prev,
      ref: {
        type: 'joint',
        id: joint.id,
      },
      state: 'none',
    });
  };

  return (
    <Container style={style}>
      <Content
        trunk={{
          type: 'joint',
          id: joint.id,
        }}
        editable={joint.master.id === prev.id}
        onClick={onJointClick}
      >
        {index}
      </Content>
      {children}
    </Container>
  );
};
