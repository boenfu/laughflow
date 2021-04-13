import {
  Add,
  Check,
  Copy,
  Cut,
  Expand,
  Jump,
  More,
  Trash,
} from '@magicflow/icons';
import React, {FC, MouseEvent, useContext} from 'react';
import styled from 'styled-components';

import {IconButton} from '../components';
import {EditorContext} from '../context';
// import {createNode} from '../procedure-editor';

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
    type: 'addSingle',
    icon: Add,
    title: '添加普通节点',
  },
  {
    type: 'addBranches',
    icon: Add,
    title: '添加分支节点',
  },
  {
    type: 'done',
    icon: Check,
    title: '展示完成情况',
  },
  {
    type: 'connect',
    icon: Jump,
    title: '连接节点',
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

    let activeInfo = editor.activeInfo;

    const onNodeActionClick = (event: MouseEvent<HTMLDivElement>): void => {
      if (!activeInfo) {
        return;
      }

      event.stopPropagation();

      let type = event.currentTarget.dataset
        .type as typeof NODE_ACTIONS[number]['type'];

      switch (type) {
        case 'addSingle':
        case 'addBranches':
          // createNode({type})
          // void editor.procedure.createNode(activeInfo.ref);
          break;
        case 'done':
          // void editor.procedure.createLeaf(activeInfo.ref, type);
          break;
        case 'connect':
        case 'cut':
        case 'copy':
          editor.active(type);
          break;
        case 'trash':
          // if (activeIdentity.ref.type === 'node') {
          //   void editor.procedure.deleteNode(
          //     activeIdentity.ref.id,
          //     activeIdentity.prev,
          //   );
          // }

          break;
        case 'more':
          // editor.emitConfig(activeIdentity.ref);
          break;

        default:
          break;
      }
    };

    return (
      <Wrapper onClick={event => event.stopPropagation()}>
        <Left />
        <Mid />
        <Right>
          {activeInfo
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
