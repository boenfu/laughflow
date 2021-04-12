import {ProcedureBranchesTreeNode} from '@magicflow/procedure';
import React, {CSSProperties, FC} from 'react';
import styled from 'styled-components';

import {Flow} from '../../flow';

const Wrapper = styled.div`
  display: inline-block;
  border: 1px solid #c8cdd8;
  border-radius: 8px;
  padding-bottom: 16px;
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
