import {Trash} from '@magicflow/icons';
import Tooltip from 'rc-tooltip';
import React, {FC, createElement, useContext} from 'react';
import styled from 'styled-components';

import {MenuPopup, transition} from '../../components';
import {LeafMetadata} from '../../core';
import {EditorContext} from '../context';

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

const LeafAction = styled(MenuPopup)`
  @keyframes leaf-transform {
    0% {
      transform: translate3D(-12px, 0, 0);
      opacity: 0;
    }

    100% {
      transform: translate3D(0, 0, 0);
      opacity: 1;
    }
  }

  opacity: 0;
  width: 78px;
  max-width: 156px;
  height: 28px;
  line-height: 28px;
  color: #333;
  animation: leaf-transform 0.2s linear both;

  & + & {
    margin-top: 8px;
  }
`;

export const Leaf: FC<LeafProps> = ({leaf}) => {
  const {procedure} = useContext(EditorContext);

  let renderDescriptor = procedure.getLeafRenderDescriptor(leaf.type);

  if (!renderDescriptor) {
    return <></>;
  }

  const onDelete = (): void => procedure.deleteLeaf(leaf.id);

  let {render: Component, actions} = renderDescriptor;

  return (
    <Wrapper>
      <Tooltip
        overlayStyle={{width: 200}}
        placement="right"
        trigger={['hover']}
        destroyTooltipOnHide={true}
        overlay={
          <LeafActionWrapper>
            {actions.map(({label}, index) => (
              <LeafAction key={index}>{label}</LeafAction>
            ))}

            <LeafAction key="delete" onClick={onDelete}>
              <LeafActionIcon>
                <Trash />
              </LeafActionIcon>
              删除
            </LeafAction>
          </LeafActionWrapper>
        }
      >
        <LeafContent>{createElement(Component, {leaf})}</LeafContent>
      </Tooltip>
    </Wrapper>
  );
};
