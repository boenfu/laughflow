import {Expand} from '@magicflow/icons';
import React, {FC, MouseEvent, useContext} from 'react';
import styled from 'styled-components';

import {IconButton} from '../../components';
import {EditorContext} from '../../context';

import {ActionDefinition, actionDefinitionDict} from './@actions';

export interface NavigationProps {
  onFullScreenToggle(): void;
}

const Wrapper = styled.div`
  position: absolute;
  height: 56px;
  top: 0;
  left: 0px;
  right: 0px;
  margin: 0 24px;

  display: flex;
  align-items: center;
  z-index: 2;
`;

const Left = styled.div``;

const Mid = styled.div`
  flex: 1;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
`;

export const Navigation: FC<NavigationProps> = React.memo(
  ({onFullScreenToggle}) => {
    const {editor} = useContext(EditorContext);

    let activeInfo = editor.activeInfo;

    let {actions, handler}: Partial<ActionDefinition> = activeInfo
      ? actionDefinitionDict[activeInfo.value.type]
      : {};

    const onNodeActionClick = (event: MouseEvent<HTMLDivElement>): void => {
      if (!activeInfo || activeInfo.value.type === 'flow') {
        return;
      }

      event.stopPropagation();

      handler?.(editor, String(event.currentTarget.dataset.type));
    };

    return (
      <Wrapper onClick={event => event.stopPropagation()}>
        <Left />
        <Mid />
        <Right>
          {actions?.map(({type, icon: Icon, title}) => (
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
  },
);
