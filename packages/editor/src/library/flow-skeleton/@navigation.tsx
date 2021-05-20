import {Expand} from '@magicflow/icons';
import classNames from 'classnames';
import React, {FC, MouseEvent} from 'react';
import styled from 'styled-components';

import {IconButton} from '../@common';

import {useSkeletonContext} from './@context';
import {Action} from './flow-skeleton';

const Wrapper = styled.div`
  position: absolute;
  height: 56px;
  top: 0;
  left: 0px;
  right: 0px;
  padding: 0 24px;

  display: flex;
  align-items: center;
  z-index: 2;
  pointer-events: none;

  &.active {
    * {
      color: #fff;
      box-shadow: none;
      background-color: transparent;
    }

    background: #414c63;
    box-shadow: 0px 4px 8px rgba(50, 57, 72, 0.3);
    backdrop-filter: blur(3px);
  }
`;

const Left = styled.div``;

const Mid = styled.div`
  flex: 1;
`;

const Right = styled.div`
  display: flex;
  align-items: center;

  * {
    pointer-events: all !important;
  }
`;

export const Navigation: FC = React.memo(() => {
  const {active, isActive, getActions, onAction} = useSkeletonContext();
  const actions: Action[] = getActions?.(active) || [];

  const onNodeActionClick = (event: MouseEvent<HTMLDivElement>): void => {
    event.stopPropagation();

    let action = actions.find(
      action => action.type === String(event.currentTarget.dataset.type),
    );

    if (!action) {
      return;
    }

    onAction?.(action);
  };

  const onFullScreenToggle = (event: MouseEvent): void => {
    let target = event.target as HTMLElement;

    while (target.parentNode) {
      let parent = target.parentNode as HTMLElement;

      if (parent.classList.contains('flow-skeleton')) {
        if (document.fullscreenElement) {
          void document.exitFullscreen();
        } else {
          void parent?.requestFullscreen();
        }

        return;
      }

      target = parent;
    }
  };

  return (
    <Wrapper
      className={classNames({active: isActive()})}
      onClick={event => event.stopPropagation()}
    >
      <Left />
      <Mid />
      <Right>
        {actions.map(({type, icon: Icon, title}) => (
          <IconButton
            key={type}
            tooltip={title}
            data-type={type}
            onClick={onNodeActionClick}
          >
            <Icon />
          </IconButton>
        ))}
        <IconButton tooltip="全屏" onClick={onFullScreenToggle}>
          <Expand />
        </IconButton>
      </Right>
    </Wrapper>
  );
});
