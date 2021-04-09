import {ProcedureFlow} from '@magicflow/procedure';
import React, {CSSProperties, FC} from 'react';
import styled from 'styled-components';

import {Node} from '../node';

const Wrapper = styled.div`
  background-color: #fff;
`;

export interface FlowProps {
  className?: string;
  flow: ProcedureFlow;
  readOnly?: boolean;
  style?: CSSProperties;
}

export const Flow: FC<FlowProps> = ({flow}) => {
  return (
    <Wrapper>
      {flow.starts.map(node => (
        <Node key={node.id} node={node} />
      ))}
    </Wrapper>
  );
};
