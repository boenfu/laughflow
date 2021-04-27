import {ProcedureFlow} from '@magicflow/procedure';
import {TaskFlow} from '@magicflow/task';
import classNames from 'classnames';
import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {
  ConnectionLine,
  LINE_HEIGHT_DEFAULT,
  RESOURCE_WIDTH,
  transition,
} from '../../@common';
import {Leaf} from '../@leaf';
import {Node} from '../@node';

const Container = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding-top: ${LINE_HEIGHT_DEFAULT / 2}px;
`;

const Wrapper = styled.div`
  min-width: ${RESOURCE_WIDTH}px;
  padding-top: ${LINE_HEIGHT_DEFAULT}px;
  padding-bottom: 16px;

  &.multi {
    padding-top: ${LINE_HEIGHT_DEFAULT * 2}px;
  }

  ${transition(['border-color'])}
`;

const FlowStart = styled.div`
  display: inline-block;
  width: 48px;
  height: 24px;
  border-radius: 4px;
  background-color: transparent;
  border: 1px solid #c8cdd8;
  cursor: pointer;
  z-index: 1;

  &.active {
    border-color: #296dff;
  }

  ${transition(['border-color'])}
`;

export interface FlowProps {
  className?: string;
  flow: ProcedureFlow;
  taskFlow?: TaskFlow;
}

export const Flow: FC<FlowProps> = ({flow, taskFlow}) => {
  let startNodes = flow.starts;

  let definitionToTaskNodeMap = new Map(
    taskFlow?.startNodes.map(node => [node.definition.id, node]),
  );

  return (
    <Container>
      {flow.parent ? (
        <ConnectionLine
          startNode="parent"
          placement={{
            start: 'top',
          }}
        />
      ) : undefined}
      <FlowStart data-id={flow.id} />
      <Wrapper
        className={classNames({
          multi: startNodes.length > 1,
        })}
      >
        {startNodes.length ? (
          startNodes.map((node, index, array) => (
            <Fragment key={`${node.id}-${index}`}>
              <ConnectionLine
                startNode="parent"
                placement={{
                  start: 'top',
                }}
                first={index === 0 && array.length > 1}
                last={index === array.length - 1 && array.length > 1}
              />
              <Node
                node={node}
                taskNode={definitionToTaskNodeMap.get(node.id)}
              />
            </Fragment>
          ))
        ) : (
          <>
            <ConnectionLine
              startNode="parent"
              placement={{
                start: 'top',
              }}
            />
            <Leaf />
          </>
        )}
      </Wrapper>
    </Container>
  );
};
