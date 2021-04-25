import {ProcedureBranchesTreeNode} from '@magicflow/procedure';
import classNames from 'classnames';
import React, {CSSProperties, FC} from 'react';
import styled from 'styled-components';

import {RESOURCE_WIDTH, transition} from '../../../@common';
import {Flow} from '../../flow';

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
  min-width: ${RESOURCE_WIDTH}px;
  min-height: 83px;

  border: 1px solid #c8cdd8;
  border-radius: 8px;
  margin: 0 17px;
  cursor: pointer;

  pointer-events: all !important;

  &.active {
    border-color: #296dff;
  }

  ${transition(['border-color'])}
`;

export interface BranchesNodeProps {
  node: ProcedureBranchesTreeNode;
  className?: string;
  readOnly?: boolean;
  style?: CSSProperties;
}

export const BranchesNode: FC<BranchesNodeProps> = ({node}) => {
  return (
    <Wrapper
      // TODO
      className={classNames({active: false})}
      data-id={node.id}
      data-prev={node.prev.id}
    >
      {node.flows.map(flow => (
        <Flow key={flow.id} flow={flow} />
      ))}
    </Wrapper>
  );
};
