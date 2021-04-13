import {ProcedureFlow} from '@magicflow/procedure';
import classNames from 'classnames';
import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {transition} from '../../components';
import {RESOURCE_WIDTH} from '../common';
import {ConnectionLine, LINE_HEIGHT_DEFAULT} from '../connection-line';
import {Node} from '../node';

const Wrapper = styled.div`
  display: inline-block;
  vertical-align: top;

  min-width: ${RESOURCE_WIDTH}px;
  padding-top: ${LINE_HEIGHT_DEFAULT}px;
  padding-bottom: 16px;

  &.multi {
    padding-top: ${LINE_HEIGHT_DEFAULT * 2}px;
  }

  ${transition(['border-color'])}
`;

export interface FlowProps {
  className?: string;
  flow: ProcedureFlow;
  readOnly?: boolean;
  start?: boolean;
}

export const Flow: FC<FlowProps> = ({flow, start}) => {
  let startNodes = flow.starts;

  return (
    <Wrapper
      className={classNames({multi: startNodes.length > 1, start})}
      data-id={flow.id}
    >
      {startNodes.length ? (
        startNodes.map((node, index, array) => (
          <Fragment key={`${node.id}-${index}`}>
            {flow.parent ? (
              <ConnectionLine
                startNode="parent"
                placement={{
                  start: 'top',
                }}
                start={flow}
                next={node}
                first={index === 0 && array.length > 1}
                last={index === array.length - 1 && array.length > 1}
              />
            ) : undefined}
            <Node node={node} />
          </Fragment>
        ))
      ) : (
        <ConnectionLine
          startNode="parent"
          placement={{
            start: 'top',
          }}
          start={flow}
          next={false}
        />
      )}
    </Wrapper>
  );
};
