import {More, PlusCircleSolid as _PlusCircleSolid} from '@magicflow/icons';
import React, {FC} from 'react';
import styled from 'styled-components';

import {MenuPopup, transition} from '../../components';

export interface LeavesProps {}

const MoreButton = styled(More)`
  font-size: 18px;
  flex: none;
  opacity: 1;
  transform: translate(0, 0);
  cursor: pointer;

  ${transition(['transform', 'opacity'])}
`;

const Menus = styled(MenuPopup)`
  font-size: 24px;
  padding: 2px 10px;

  opacity: 0;
  pointer-events: none;
  transform: translate(0, 28px);
  ${transition(['transform', 'opacity'])}

  svg {
    cursor: pointer;

    & + & {
      margin-left: 4px;
    }

    &:hover {
      transform: translateY(-2px);
      opacity: 0.8;
    }

    &.disabled {
      transform: translateY(0);
      opacity: 0.3;
    }

    ${transition(['transform', 'opacity'])}
  }
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  width: 18px;
  height: 18px;
  overflow: visible;
  padding-left: 14px;

  &:hover {
    ${MoreButton} {
      opacity: 0;
      transform: translate(-32px, 0);
    }

    ${Menus} {
      opacity: 1;
      pointer-events: unset;
      transform: translate(-42px, 0);
    }
  }
`;

export const Leaves: FC<LeavesProps> = () => {
  return (
    <Wrapper>
      <MoreButton />
      <Menus>1</Menus>
    </Wrapper>
  );
};
