import {TrunkRef} from '@magicflow/core';
import {Connect, Copy, Cut, Jump} from '@magicflow/icons';
import classnames from 'classnames';
import React, {FC, useContext} from 'react';
import styled from 'styled-components';

import {EditorContext} from '../../../context';
import {ActiveTrunk} from '../../../editor';

export interface EditingContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  trunk: TrunkRef;
  editable?: boolean;
}

const Wrapper = styled.div`
  position: relative;

  &.active {
    box-shadow: 0 6px 12px rgba(58, 69, 92, 0.16);
  }

  &.editing {
    &::before {
      opacity: 0;
      margin: 0px;
      height: 100%;
      transform: translate(-12px, -12px);
      padding: 12px;
      position: absolute;
      top: 0px;
      left: 0px;
      width: 100%;
      content: '';
      z-index: 2;
      border: 1px dashed #296dff;
      border-radius: 4px;
      pointer-events: none;
    }

    &:hover {
      &::before {
        opacity: 1;
      }
    }

    &.selected,
    &.active {
      &::before {
        opacity: 1;
        background-color: rgba(255, 255, 255, 0.5);
      }
    }
  }
`;

const EditingIconWrapper = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;

  top: 100%;
  left: 50%;
  transform: translate(-50%, -4px);

  background: #296dff;
  color: #fff;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.08);
  border-radius: 28px;

  z-index: 3;
`;

const STATE_ICON_DICT: Partial<
  {[key in ActiveTrunk['state']]: React.ElementType}
> = {
  joining: Connect,
  cutting: Cut,
  copying: Copy,
  connecting: Jump,
};

const EditingIcon: FC<{state: ActiveTrunk['state']}> = ({state}) => {
  let Component = STATE_ICON_DICT[state];

  if (!Component) {
    return <></>;
  }

  return (
    <EditingIconWrapper>
      <Component />
    </EditingIconWrapper>
  );
};
export const EditingContent: FC<EditingContentProps> = ({
  className,
  trunk,
  editable = true,
  children,
  ...props
}) => {
  const {editor} = useContext(EditorContext);

  let activeTrunk = editor.activeTrunk;

  let editing = editable && activeTrunk && activeTrunk?.state !== 'none';
  let active = activeTrunk?.ref?.id === trunk.id;
  let selected = activeTrunk?.relationTrunks?.some(ref => ref.id === trunk.id);

  return (
    <Wrapper
      {...props}
      className={classnames([
        className,
        {
          editing,
          active,
          selected,
        },
      ])}
    >
      {children}
      {editing && active ? (
        <EditingIcon state={activeTrunk!.state} />
      ) : undefined}
    </Wrapper>
  );
};
