import classNames from 'classnames';
import React, {FC, Fragment, MouseEvent} from 'react';
import styled from 'styled-components';

import {LINE_HEIGHT_DEFAULT, RESOURCE_WIDTH, transition} from '../@common';

import {useSkeletonContext} from './@context';
import {Node} from './@node';
import {Wire} from './@wire';
import {IFlow, INode} from './flow-skeleton';

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
  box-sizing: border-box;
  width: 40px;
  height: 24px;
  border-radius: 24px;
  background-color: transparent;
  border: 1px solid #c8cdd8;
  z-index: 1;
  cursor: pointer;

  &.active {
    border-color: #296dff;
  }

  ${transition(['border-color'])}
`;

export interface FlowProps {
  className?: string;
  flow: IFlow;
  nodeRender: FC<{node: INode}>;
  root?: boolean;
}

export const Flow: FC<FlowProps> = ({flow, nodeRender, root}) => {
  const {readonly, setActive, isActive} = useSkeletonContext();

  const onActiveFlow = (event: MouseEvent): void => {
    event.stopPropagation();
    setActive(flow);
  };

  let startNodes = flow.starts;

  return (
    <Container>
      {!root ? (
        <Wire
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
          active: isActive(flow),
        })}
        {...(readonly
          ? {}
          : {
              onClick: onActiveFlow,
            })}
      />
      <Wrapper
        className={classNames({
          multi: startNodes.length > 1,
        })}
      >
        {startNodes.length ? (
          startNodes.map((node, index, array) => (
            <Fragment key={`${node.id}-${index}`}>
              <Wire
                startNode="parent"
                placement={{
                  start: 'top',
                }}
                start={flow}
                next={node}
                first={index === 0 && array.length > 1}
                last={index === array.length - 1 && array.length > 1}
              />
              <Node node={node} component={nodeRender} />
            </Fragment>
          ))
        ) : (
          <Wire
            startNode="parent"
            placement={{
              start: 'top',
            }}
            start={flow}
          />
        )}
      </Wrapper>
    </Container>
  );
};
