import {ProcedureBranchesTreeNode} from '@magicflow/procedure';
import React, {CSSProperties, FC} from 'react';
import styled from 'styled-components';

import {Flow} from '../../flow';

const Wrapper = styled.div`
  position: relative;
  margin: 0 17px;
  width: 220px;
  min-height: 83px;
  display: inline-block;
  vertical-align: top;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  background-color: #ccc;
  cursor: pointer;
`;

export interface BranchesNodeProps {
  node: ProcedureBranchesTreeNode;
  className?: string;
  readOnly?: boolean;
  style?: CSSProperties;
}

export const BranchesNode: FC<BranchesNodeProps> = ({node}) => {
  return (
    <Wrapper>
      {node.flows.map(flow => (
        <Flow key={flow.id} flow={flow} />
      ))}
    </Wrapper>
  );
};
