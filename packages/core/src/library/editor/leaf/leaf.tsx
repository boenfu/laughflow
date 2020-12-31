import {Trash} from '@magicflow/icons';
import Tooltip from 'rc-tooltip';
import React, {FC} from 'react';
import styled from 'styled-components';

import {MenuPopup, transition} from '../../components';
import {LeafMetadata, LeafType} from '../../core';

import {DoneLeaf} from './@done';
import {TerminateLeaf} from './@terminate';
import {WormholeLeaf} from './@wormhole';

export interface LeafProps {
  leaf: LeafMetadata;
}

const Wrapper = styled.div`
  margin: 0 16px;
  display: inline-block;
  text-align: center;
  vertical-align: top;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  ${transition(['opacity'])}
`;

const LeafContent = styled.div`
  display: inline-flex;
`;

const LeafActionWrapper = styled.div`
  padding-left: 6px;
  font-size: 12px;
  cursor: pointer;
`;

const LeafActionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 16px;
  margin-right: 6px;
`;

const LeafAction = styled(MenuPopup)<{delay: number}>`
  @keyframes leaf-transform {
    0% {
      transform: translate(
        ${props => `-${Math.abs(props.delay) * 14}px, ${props.delay * 2}px`}
      );
      opacity: 0;
    }

    100% {
      opacity: 1;
      transform: translate(0, 0);
    }
  }

  opacity: 0;
  width: 78px;
  max-width: 156px;
  height: 28px;
  line-height: 28px;
  color: #333;
  animation: leaf-transform 0.2s ${props => `${Math.abs(props.delay) * 0.2}s`}
    linear both;

  & + & {
    margin-top: 8px;
  }
`;

const LEAF_COMPONENTS: Partial<
  {[key in LeafType]: FC<{leaf: LeafMetadata}>}
> = {
  done: DoneLeaf,
  terminate: TerminateLeaf,
  wormhole: WormholeLeaf,
};

export const Leaf: FC<LeafProps> = ({leaf}) => {
  let Leaf = LEAF_COMPONENTS[leaf.type]!;

  let actions = Array(Math.round(Math.random() * 6)).fill(undefined);

  return (
    <Wrapper>
      <Tooltip
        overlayStyle={{width: 200}}
        placement="right"
        trigger={['hover']}
        destroyTooltipOnHide={true}
        overlay={
          <LeafActionWrapper>
            {actions.map((_, index) => (
              <LeafAction key={index} delay={(actions.length - 1) / 2 - index}>
                <LeafActionIcon>
                  <Trash />
                </LeafActionIcon>
                删除
              </LeafAction>
            ))}
          </LeafActionWrapper>
        }
      >
        <LeafContent>
          <Leaf leaf={leaf} />
        </LeafContent>
      </Tooltip>
    </Wrapper>
  );
};
