import {Node as NodeDefinition, NodeId} from '@magicflow/core';
import {ProcedureTreeNode} from '@magicflow/procedure';
import React, {CSSProperties, FC, useContext} from 'react';
import styled from 'styled-components';

import {EditorContext} from '../../context';

import {BranchesNode} from './@branches';
import {SingleNode} from './@single';

export interface NodeProps {
  node: ProcedureTreeNode;
  className?: string;
  readOnly?: boolean;
  style?: CSSProperties;
}

const Container = styled.div`
  display: inline-block;
  text-align: center;
  white-space: nowrap;
  vertical-align: top;
`;

export const Node: FC<NodeProps> = ({style, node, children}) => {
  // const {editor} = useContext(EditorContext);

  return (
    <Container style={style}>
      {node.type === 'singleNode' ? (
        <SingleNode node={node} />
      ) : (
        <BranchesNode node={node} />
      )}
      {children}
    </Container>
  );
};
