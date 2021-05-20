import {Branch} from '@magicflow/icons';
import classNames from 'classnames';
import React, {FC, Fragment, MouseEvent} from 'react';
import styled from 'styled-components';

import {
  Icon,
  LINE_HEIGHT_DEFAULT,
  RESOURCE_WIDTH,
  transition,
} from '../@common';

import {useSkeletonContext} from './@context';
import {Flow} from './@flow';
import {Wire} from './@wire';
import {INode} from './flow-skeleton';

const Container = styled.div`
  display: inline-block;
  text-align: center;
  white-space: nowrap;
  vertical-align: top;
`;

const Row = styled.div`
  padding-top: ${LINE_HEIGHT_DEFAULT}px;
  text-align: center;

  &.multi {
    padding-top: ${LINE_HEIGHT_DEFAULT * 2}px;
  }
`;

const AddFlow = styled(Branch)`
  ${Icon};
  ${transition(['color'])}

  font-size: 14px;
  color: #5f6571;
  background-color: transparent;
`;

const NodeWrapper = styled.div`
  display: inline-flex;
`;

const AddFlowWrapper = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 36px;
  height: 22px;

  top: 0;
  left: 50%;

  transform: translate(-50%, -50%);
  background: #e5e7eb;
  border: 1px solid #c8cdd8;
  box-sizing: border-box;
  border-radius: 28px;

  ${transition(['border-color'])}

  &:hover {
    border-color: #296dff;

    ${AddFlow} {
      color: #296dff;
    }
  }
`;

const FlowsWrapper = styled.div`
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

export interface NodeProps {
  node: INode;
  component: FC<{node: INode}>;
}

export const Node: FC<NodeProps> = ({node, component: Component}) => {
  const {readonly, setActive, isActive} = useSkeletonContext();

  const onActiveNode = (event: MouseEvent): void => {
    event.stopPropagation();
    setActive(node);
  };

  let nexts = node.nexts;
  let editingProps = readonly
    ? {}
    : {
        onClick: onActiveNode,
      };

  return (
    <Container>
      {'flows' in node ? (
        <FlowsWrapper
          className={classNames({active: isActive(node)})}
          {...editingProps}
        >
          {node.flows!.map(flow => (
            <Flow key={flow.id} flow={flow} nodeRender={Component} />
          ))}
          <AddFlowWrapper>
            <AddFlow onClick={() => {}} />
          </AddFlowWrapper>
        </FlowsWrapper>
      ) : (
        <NodeWrapper {...editingProps}>
          <Component node={node} />
        </NodeWrapper>
      )}

      <Row className={classNames({multi: nexts.length > 1})}>
        {nexts.length ? (
          nexts.map((next, index, array) => {
            return (
              <Fragment key={`${next.id}-${index}`}>
                <Wire
                  startNode={['parent', 'previousSibling']}
                  start={node}
                  next={next}
                  first={index === 0 && array.length > 1}
                  last={index === array.length - 1 && array.length > 1}
                />
                <Node node={next} component={Component} />
              </Fragment>
            );
          })
        ) : (
          <Wire startNode={['parent', 'previousSibling']} start={node} />
        )}
      </Row>
    </Container>
  );
};