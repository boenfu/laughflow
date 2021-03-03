import 'rc-dropdown/assets/index.css';

import Dropdown from 'rc-dropdown';
import {DropdownProps} from 'rc-dropdown/lib/Dropdown';
import _Menu, {Item, MenuProps} from 'rc-menu';
import React, {PropsWithChildren, ReactElement, ReactNode} from 'react';
import styled from 'styled-components';

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
  min-height: 24px;
  max-height: 144px;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.16);
  border-radius: 2px;
  border: none;
  overflow: auto;
`;

interface DropdownSelectProps<T> {
  resources: T[];
  selectItem: {key: keyof T; render: string | ((item: T) => ReactNode)};
  trigger?: DropdownProps['trigger'];
  onSelect?: MenuProps['onSelect'];
  onVisibleChange?: (visible: boolean) => void;
}

export function DropdownSelect<T>({
  resources,
  selectItem: {key, render},
  children,
  trigger = ['click'],
  onSelect,
  onVisibleChange,
}: PropsWithChildren<DropdownSelectProps<T>>): ReactElement {
  return (
    <Dropdown
      trigger={trigger}
      overlay={
        <Menu onSelect={onSelect}>
          {resources.map(item => (
            <MenuItem key={String(item[key])}>
              {typeof render === 'string'
                ? item[render as keyof T]
                : render(item)}
            </MenuItem>
          ))}
        </Menu>
      }
      animation="slide-up"
      onVisibleChange={onVisibleChange}
    >
      {children as ReactElement}
    </Dropdown>
  );
}
