import {ProcedureBranchesTreeNode} from '@magicflow/procedure';
import {TaskBranchesNode} from '@magicflow/task';
import classNames from 'classnames';
import React, {CSSProperties, FC} from 'react';
import styled from 'styled-components';

import {RESOURCE_WIDTH, transition} from '../../../@common';
import {Flow} from '../../@flow';

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
  min-width: ${RESOURCE_WIDTH}px;
  min-height: 83px;

  border: 1px solid #c8cdd8;
  border-radius: 8px;
  margin: 0 17px;
  cursor: pointer;

  &.active {
    border-color: #296dff;
  }

  ${transition(['border-color'])}
`;

export interface BranchesNodeProps {
  node: ProcedureBranchesTreeNode;
  taskNode?: TaskBranchesNode;
  className?: string;
  style?: CSSProperties;
}

export const BranchesNode: FC<BranchesNodeProps> = ({node, taskNode}) => {
  let definitionToTaskFlowMap = new Map(
    taskNode?.flows.map(flow => [flow.definition.id, flow]),
  );

  return (
    <Wrapper
      // TODO
      className={classNames({active: false})}
      data-id={node.id}
      data-prev={node.prev.id}
    >
      {node.flows.map(flow => (
        <Flow
          key={flow.id}
          flow={flow}
          taskFlow={definitionToTaskFlowMap.get(flow.id)}
        />
      ))}
    </Wrapper>
  );
};
