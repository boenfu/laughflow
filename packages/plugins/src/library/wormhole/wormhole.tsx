import 'rc-dropdown/assets/index.css';

import {ILeafPlugin, IPlugin, PluginEventHandler} from '@magicflow/core';
import {ConnectNode} from '@magicflow/icons';
import Dropdown from 'rc-dropdown';
import _Menu, {Item} from 'rc-menu';
import React, {FC} from 'react';
import styled from 'styled-components';

import {WormholeLeaf} from './@leaf';

declare module '@magicflow/core' {
  interface NodeMetadata {}
}

const MenuItem = styled(Item)`
  && {
    font-size: 13px;
    line-height: 36px;
    padding: 0 0 0 16px;
    color: #333;
    cursor: pointer;

    &:hover,
    &.rc-dropdown-menu-item-selected {
      background-color: rgba(0, 0, 0, 0.06);
    }

    &::after {
      display: none;
    }
  }
`;

const Menu = styled(_Menu)`
  width: 140px;
  max-height: 144px;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.16);
  border-radius: 2px;
  border: none;
  overflow: auto;
`;

const Selector: FC = () => {
  return (
    <Dropdown
      trigger={['click']}
      overlay={
        <Menu onSelect={() => {}}>
          <MenuItem key="1">one</MenuItem>
          <MenuItem key="12">one</MenuItem>
          <MenuItem key="132">one</MenuItem>
          <MenuItem key="11232">one</MenuItem>
          <MenuItem key="11232">one</MenuItem>
        </Menu>
      }
      animation="slide-up"
      onVisibleChange={console.log}
    >
      <ConnectNode />
    </Dropdown>
  );
};

export const wormhole: IPlugin<'wormhole'> = {
  leaves: [
    {
      type: 'wormhole',
      render: WormholeLeaf,
      selectorRender: Selector,
      async onCreate({preventDefault}) {
        preventDefault();
      },
    },
  ],
};

export class WormholePlugin<TLeaf extends string = 'wormhole'>
  implements IPlugin<TLeaf> {
  leaves: ILeafPlugin<TLeaf>[];

  constructor() {
    this.leaves = [
      {
        type: 'wormhole' as TLeaf,
        render: WormholeLeaf,
        selectorRender: this.selectorRender,
        onCreate: this.onCreate,
      },
    ];
  }

  private selectorRender: FC = () => {
    return (
      <Dropdown
        trigger={['click']}
        overlay={
          <Menu onSelect={() => {}}>
            <MenuItem key="1">one</MenuItem>
            <MenuItem key="12">one</MenuItem>
            <MenuItem key="132">one</MenuItem>
            <MenuItem key="11232">one</MenuItem>
            <MenuItem key="112332">one</MenuItem>
          </Menu>
        }
        animation="slide-up"
        onVisibleChange={console.log}
      >
        <ConnectNode />
      </Dropdown>
    );
  };

  private onCreate: PluginEventHandler = ({preventDefault, target}) => {
    console.log(target);

    preventDefault();
  };
}
