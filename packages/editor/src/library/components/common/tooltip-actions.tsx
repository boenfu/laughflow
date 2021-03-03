import Tooltip from 'rc-tooltip';
import React, {PropsWithChildren, ReactElement, ReactNode} from 'react';
import styled from 'styled-components';

import {MenuPopup} from './menu-popup';

export interface TooltipAction<TName> {
  name: TName;
  icon?: ReactElement;
  content: ReactNode;
  onAction(): void;
}

export interface TooltipActionsProps<TNames> {
  actions: TooltipAction<TNames>[];
}

const ActionWrapper = styled.div`
  padding-left: 6px;
  font-size: 12px;
  cursor: pointer;
`;

const ActionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 16px;
  margin-right: 6px;
`;

const Action = styled(MenuPopup)`
  @keyframes action-transform {
    0% {
      transform: translate3D(-12px, 0, 0);
      opacity: 0;
    }

    100% {
      transform: translate3D(0, 0, 0);
      opacity: 1;
    }
  }

  opacity: 0;
  width: 78px;
  max-width: 156px;
  height: 28px;
  line-height: 28px;
  color: #333;
  animation: action-transform 0.2s linear both;

  & + & {
    margin-top: 8px;
  }
`;

export function TooltipActions<TActionNames>({
  actions,
  children,
}: PropsWithChildren<TooltipActionsProps<TActionNames>>): ReactElement {
  return (
    <Tooltip
      overlayStyle={{width: 200}}
      placement="right"
      trigger={['hover']}
      destroyTooltipOnHide={true}
      overlay={
        <ActionWrapper>
          {actions.map(({name, icon, content, onAction}) => (
            <Action onClick={onAction} key={String(name)}>
              {icon ? <ActionIcon>{icon}</ActionIcon> : undefined}
              {content}
            </Action>
          ))}
        </ActionWrapper>
      }
    >
      {children as ReactElement}
    </Tooltip>
  );
}
