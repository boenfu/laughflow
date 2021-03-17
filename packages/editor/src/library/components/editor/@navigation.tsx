import {
  Add,
  Check,
  Connect,
  Copy,
  Cut,
  Expand,
  Jump,
  More,
  Trash,
  Wrong,
} from '@magicflow/icons';
import React, {FC, MouseEvent, useContext} from 'react';
import styled from 'styled-components';

import {EditorContext} from '../../context';
import {IconButton} from '../common';

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

const NODE_ACTIONS = [
  {
    type: 'done',
    icon: Check,
    title: '节点完成',
  },
  {
    type: 'terminate',
    icon: Wrong,
    title: '节点中止',
  },
  {
    type: 'connect',
    icon: Jump,
    title: '跳转节点',
  },
  {
    type: 'join',
    icon: Connect,
    title: '连接节点',
  },
  {
    type: 'add',
    icon: Add,
    title: '添加节点',
  },
  {
    type: 'cut',
    icon: Cut,
    title: '剪切节点',
  },
  {
    type: 'copy',
    icon: Copy,
    title: '复制节点',
  },
  {
    type: 'trash',
    icon: Trash,
    title: '删除节点',
  },
  {
    type: 'more',
    icon: More,
    title: '更多',
  },
] as const;

export const Navigation: FC<NavigationProps> = React.memo(
  ({onFullScreenToggle}) => {
    const {editor} = useContext(EditorContext);

    let activeTrunk = editor.activeTrunk;

    const onNodeActionClick = (event: MouseEvent<HTMLDivElement>): void => {
      if (!activeTrunk) {
        return;
      }

      event.stopPropagation();

      let type = event.currentTarget.dataset
        .type as typeof NODE_ACTIONS[number]['type'];

      switch (type) {
        case 'add':
          void editor.procedure.createNode(activeTrunk.ref);
          break;
        case 'done':
        case 'terminate':
          void editor.procedure.createLeaf(activeTrunk.ref, type);
          break;
        case 'connect':
          editor.setActiveTrunk({...activeTrunk, state: 'connecting'});
          break;
        case 'join':
          editor.setActiveTrunk({...activeTrunk, state: 'joining'});
          break;
        case 'cut':
          editor.setActiveTrunk({...activeTrunk, state: 'cutting'});
          break;
        case 'copy':
          editor.setActiveTrunk({...activeTrunk, state: 'copying'});
          break;
        case 'trash':
          if (activeTrunk.ref.type === 'node') {
            void editor.procedure.deleteNode(
              activeTrunk.ref.id,
              activeTrunk.prev,
            );
          }

          break;

        default:
          break;
      }
    };

    return (
      <Wrapper>
        <Left />
        <Mid />
        <Right>
          {activeTrunk?.ref.type === 'node'
            ? NODE_ACTIONS.map(({type, icon: Icon, title}) => (
                <IconButton
                  key={type}
                  tooltip={title}
                  data-type={type}
                  onClick={onNodeActionClick}
                >
                  <Icon />
                </IconButton>
              ))
            : undefined}
          <IconButton tooltip="全屏" onClick={onFullScreenToggle}>
            <Expand />
          </IconButton>
        </Right>
      </Wrapper>
    );
  },
);
