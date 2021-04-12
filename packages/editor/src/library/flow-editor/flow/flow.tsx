import {ProcedureFlow} from '@magicflow/procedure';
import classNames from 'classnames';
import React, {CSSProperties, FC, Fragment} from 'react';
import styled from 'styled-components';

import {ConnectionLine, LINE_HEIGHT_DEFAULT} from '../connection-line';
import {Node} from '../node';

const Wrapper = styled.div`
  display: inline-block;
  vertical-align: top;

  padding-top: ${LINE_HEIGHT_DEFAULT}px;

  &.multi {
    padding-top: ${LINE_HEIGHT_DEFAULT * 2}px;
  }
`;

export interface FlowProps {
  className?: string;
  flow: ProcedureFlow;
  readOnly?: boolean;
  style?: CSSProperties;
}

export const Flow: FC<FlowProps> = ({flow}) => {
  let startNodes = flow.starts;

  return (
    <Wrapper className={classNames({multi: startNodes.length > 1})}>
      {startNodes.length ? (
        startNodes.map((node, index, array) => (
          <Fragment key={`${node.id}-${index}`}>
            {flow.parent ? (
              <ConnectionLine
                startNode="parent"
                placement={{
                  start: 'top',
                }}
                node={node.id}
                next={node.id}
                first={index === 0 && array.length > 1}
                last={index === array.length - 1 && array.length > 1}
              />
            ) : undefined}
            <Node node={node} />
          </Fragment>
        ))
      ) : (
        <>
          <ConnectionLine
            startNode="parent"
            placement={{
              start: 'top',
            }}
            node={1 as any}
            next={1 as any}
          />
          <div />
        </>
      )}
    </Wrapper>
  );
};
