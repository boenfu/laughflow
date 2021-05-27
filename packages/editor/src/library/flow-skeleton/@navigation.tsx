import {Expand} from '@magicflow/icons';
import classNames from 'classnames';
import React, {FC, MouseEvent} from 'react';
import styled from 'styled-components';

import {IconButton, transition} from '../@common';

import {IMenu, getMenus} from './@menus';
import {useSkeletonContext} from './context';

const Wrapper = styled.div`
  position: absolute;
  height: 56px;
  top: 0;
  left: 0px;
  right: 0px;
  padding: 0 24px;

  display: flex;
  align-items: center;
  z-index: 10;

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
  const {active, activeState, setActiveState, onAction} = useSkeletonContext();
  const menus: IMenu[] = (active && getMenus?.(active)) || [];

  const onNodeMenuClick = (event: MouseEvent<HTMLDivElement>): void => {
    event.stopPropagation();

    let menu = menus.find(
      menu => menu.type === String(event.currentTarget.dataset.type),
    );

    if (!menu) {
      return;
    }

    if (menu.state) {
      setActiveState(menu.state);
      return;
    }

    let action = menu?.action?.(active!);

    if (action) {
      onAction?.(action);
    }

    setActiveState(undefined);
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
        {menus.map(({type, icon: Icon, title, state}) => (
          <IconButton
            key={type}
            light={activeClass}
            active={state && activeState === state}
            tooltip={title}
            data-type={type}
            onClick={onNodeMenuClick}
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
