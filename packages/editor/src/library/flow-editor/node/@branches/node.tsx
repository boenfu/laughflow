import {AddSolid} from '@magicflow/icons';
import {ProcedureBranchesTreeNode} from '@magicflow/procedure';
import React, {CSSProperties, FC, useContext} from 'react';
import styled from 'styled-components';

import {EditorContext} from '../../../context';
import {createFlow} from '../../../procedure-editor';
import {Icon, RESOURCE_WIDTH} from '../../common';
import {Flow} from '../../flow';

const AddFlow = styled(AddSolid)`
  ${Icon};
`;

const Wrapper = styled.div`
  position: relative;
  min-width: ${RESOURCE_WIDTH}px;
  min-height: 83px;

  display: inline-block;
  border: 1px solid #c8cdd8;
  border-radius: 8px;
  padding-bottom: 16px;

  ${AddFlow} {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translate(50%, -50%);
  }
`;

export interface BranchesNodeProps {
  node: ProcedureBranchesTreeNode;
  className?: string;
  readOnly?: boolean;
  style?: CSSProperties;
}

export const BranchesNode: FC<BranchesNodeProps> = ({node}) => {
  const {editor} = useContext(EditorContext);

  const onCreateFlow = (): void => {
    editor.edit(createFlow({node: node.id}));
  };

  return (
    <Wrapper>
      {node.flows.map(flow => (
        <Flow key={flow.id} flow={flow} />
      ))}
      <AddFlow onClick={onCreateFlow} />
    </Wrapper>
  );
};
