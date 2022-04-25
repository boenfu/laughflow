import classNames from 'classnames';
import type {FC, MouseEvent} from 'react';
import React, {Fragment} from 'react';
import styled from 'styled-components';

import {transition} from '../@common';

import {Node} from './@node';
import {LINE_HEIGHT_DEFAULT, Wire} from './@wire';
import {useSkeletonContext} from './context';
import type {IFlow, INode} from './flow-skeleton';

const Container = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;

  &:not(.readonly) {
    padding-top: ${LINE_HEIGHT_DEFAULT / 2}px;
  }
`;

const Wrapper = styled.div`
  display: flex;
  padding-top: ${LINE_HEIGHT_DEFAULT}px;
  padding-bottom: 16px;
  white-space: nowrap;

  &.multi {
    padding-top: ${LINE_HEIGHT_DEFAULT * 2}px;
  }

  ${transition(['border-color'])}
`;

const FlowStart = styled.div`
  box-sizing: border-box;
  width: 40px;
  height: 24px;
  border-radius: 24px;
  background-color: transparent;
  border: 1px solid #c8cdd8;
  z-index: 1;
  cursor: pointer;

  &.start {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 32px;
    border-color: #296dff;
    background-color: #296dff;
    color: #fff;
    font-size: 12px;
  }

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
  let multi = startNodes.length > 1;

  return (
    <Container className={classNames({readonly})}>
      {root ? (
        <FlowStart className={classNames(['start'])}>开始</FlowStart>
      ) : !readonly ? (
        <>
          <Wire
            startNode="parent"
            placement={{
              start: 'top',
            }}
            start={flow}
            next={false}
          />
          <FlowStart
            className={classNames({
              active: isActive(flow),
            })}
            onClick={onActiveFlow}
          />
        </>
      ) : undefined}

      <Wrapper
        className={classNames({
          multi,
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
                multiMark={multi}
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
