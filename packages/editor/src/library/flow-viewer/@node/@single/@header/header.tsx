import {ProcedureSingleTreeNode} from '@magicflow/procedure';
import React, {FC, createElement} from 'react';
import styled from 'styled-components';

import {transition} from '../../../../@common';
import {useViewerContext} from '../../../../flow-context';

import {DisplayName} from './@displayName';

const Wrapper = styled.div`
  display: flex;
  height: 42px;
  box-sizing: border-box;
  padding: 0 16px;
  align-items: center;
  font-size: 14px;
  color: #333333;
  background-color: #f7f7f7;
  border-bottom: 1px solid rgba(16, 42, 100, 0.08);
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;

  ${transition(['background-color', 'color'])}
`;

const HeaderExtra = styled.div`
  flex: none;
`;

export interface HeaderProps {
  node: ProcedureSingleTreeNode;
}

export const Header: FC<HeaderProps> = ({node}) => {
  const viewer = useViewerContext();

  let {headLeft, headRight} = viewer.nodeRenderDescriptor['singleNode'];

  return (
    <Wrapper className="header">
      {headLeft?.length ? (
        <HeaderExtra>
          {headLeft.reduce(
            (reactNode, component) =>
              createElement(component, {
                node,
                prevChildren: reactNode,
              }),
            <></>,
          )}
        </HeaderExtra>
      ) : undefined}
      <></>

      <DisplayName node={node.definition} />
      {headRight?.length ? (
        <HeaderExtra>
          {headRight.reduce(
            (reactNode, component) =>
              createElement(component, {
                node,
                prevChildren: reactNode,
              }),
            <></>,
          )}
        </HeaderExtra>
      ) : undefined}
    </Wrapper>
  );
};
