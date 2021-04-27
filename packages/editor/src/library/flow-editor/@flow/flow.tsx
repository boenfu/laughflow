import {ProcedureFlow} from '@magicflow/procedure';
import classNames from 'classnames';
import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {LINE_HEIGHT_DEFAULT, RESOURCE_WIDTH, transition} from '../../@common';
import {useEditorContext} from '../../flow-context';
import {ConnectionLine} from '../@connection-line';
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
  pointer-events: all !important;

  &.active {
    border-color: #296dff;
  }

  ${transition(['border-color'])}
`;

export interface FlowProps {
  className?: string;
  flow: ProcedureFlow;
}

export const Flow: FC<FlowProps> = ({flow}) => {
  const editor = useEditorContext();
  let startNodes = flow.starts;

  return (
    <Container>
      {flow.parent ? (
        <ConnectionLine
          startNode="parent"
          placement={{
            start: 'top',
          }}
          start={flow}
          next={false}
        />
      ) : undefined}
      <FlowStart
        className={classNames({
          active: editor.isActive(flow),
        })}
        data-id={flow.id}
      />
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
                start={flow}
                next={node}
                first={index === 0 && array.length > 1}
                last={index === array.length - 1 && array.length > 1}
              />
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
              start={flow}
            />
            <Leaf />
          </>
        )}
      </Wrapper>
    </Container>
  );
};
