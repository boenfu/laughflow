import {Expand} from '@magicflow/icons';
import classNames from 'classnames';
import React, {FC, MouseEvent} from 'react';
import styled from 'styled-components';

import {IconButton, transition} from '../@common';

import {IAction, getActions} from './@actions';
import {useSkeletonContext} from './@context';

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

  ${transition(['background-color'])}

  &.active {
    background-color: #414c63;
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
`;

export const Navigation: FC = React.memo(() => {
  const {active, onAction} = useSkeletonContext();
  const actions: IAction[] = (active && getActions?.(active)) || [];

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

  let activeClass = !!active;

  return (
    <Wrapper
      className={classNames({active: activeClass})}
      onClick={event => event.stopPropagation()}
    >
      <Left />
      <Mid />
      <Right>
        {actions.map(({type, icon: Icon, title}) => (
          <IconButton
            key={type}
            light={activeClass}
            tooltip={title}
            data-type={type}
            onClick={onNodeActionClick}
          >
            <Icon />
          </IconButton>
        ))}
        <IconButton
          tooltip="全屏"
          light={activeClass}
          onClick={onFullScreenToggle}
        >
          <Expand />
        </IconButton>
      </Right>
    </Wrapper>
  );
});
