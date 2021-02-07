import 'rc-dropdown/assets/index.css';

import {EditorContext} from '@magicflow/core';
import {ConnectNode} from '@magicflow/icons';
import Dropdown from 'rc-dropdown';
import _Menu, {Item, MenuProps} from 'rc-menu';
import React, {FC, useContext} from 'react';
import styled from 'styled-components';

import {getNodeDisplayName} from './@utils';

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

export const Selector: FC<{
  onSelect: MenuProps['onSelect'];
  onVisibleChange: (visible: boolean) => void;
}> = ({onSelect, onVisibleChange}) => {
  const {procedure} = useContext(EditorContext);

  return (
    <Dropdown
      trigger={['click']}
      overlay={
        <Menu onSelect={onSelect}>
          {procedure.definition.nodes.map(node => (
            <MenuItem key={node.id}>{getNodeDisplayName(node)}</MenuItem>
          ))}
        </Menu>
      }
      animation="slide-up"
      onVisibleChange={onVisibleChange}
    >
      <ConnectNode />
    </Dropdown>
  );
};
