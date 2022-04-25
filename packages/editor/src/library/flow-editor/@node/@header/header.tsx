import {ProcedureSingleTreeNode, SingleNode} from '@laughflow/procedure';
import {updateNode} from '@laughflow/procedure/operators';
import React, {FC, createElement, useContext} from 'react';
import styled from 'styled-components';

import {transition} from '../../../@common';
import {FlowEditorContext} from '../../flow-editor';

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
  const {editor} = useContext(FlowEditorContext);

  const onNodeChange = (node: SingleNode): void => {
    void editor.edit(updateNode(node));
  };

  let {headLeft, headRight} = editor.nodeRenderDescriptorDict.procedure.node;

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

      <DisplayName node={node.definition} onChange={onNodeChange} />
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
