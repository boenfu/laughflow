import React, {FC, useContext} from 'react';
import styled from 'styled-components';

import {EditorContext} from '../../context';

export interface FooterProps {}

const Wrapper = styled.div`
  position: absolute;
  height: 56px;
  bottom: 20px;
  left: 0;
  right: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;

const Button = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 144px;
  height: 44px;
  font-size: 16px;
  color: #fff;
  background: #c2c7d3;
  border-radius: 4px;

  cursor: pointer;

  &.primary {
    background: #296dff;
  }
`;

export const Footer: FC<FooterProps> = React.memo(() => {
  const {editor} = useContext(EditorContext);

  let activeTrunk = editor.activeTrunk;
  let relationTrunksLength = activeTrunk?.relationTrunks?.length;

  const onCreateJoint = (): void => {
    if (!activeTrunk) {
      return;
    }

    void editor.procedure.createJoint(
      activeTrunk.ref,
      activeTrunk?.relationTrunks || [],
    );
  };

  return (
    <Wrapper>
      {activeTrunk?.state === 'joining' ? (
        <>
          <Button>取消</Button>
          <Button
            {...(relationTrunksLength
              ? {
                  className: 'primary',

                  onClick: onCreateJoint,
                }
              : {})}
            style={{
              marginLeft: 20,
            }}
          >
            连接节点
          </Button>
        </>
      ) : undefined}
    </Wrapper>
  );
});
