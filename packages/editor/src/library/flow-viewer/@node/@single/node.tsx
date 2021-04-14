import {TaskSingleNode} from '@magicflow/task';
import classnames from 'classnames';
import React, {FC} from 'react';
import styled from 'styled-components';

import {RESOURCE_WIDTH} from '../../@common';

import {Header} from './@header';

const Container = styled.div`
  * {
    pointer-events: all !important;
  }
`;

// const BeforeWrapper = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: center;
// `;

// const AfterWrapper = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: center;
// `;

const Wrapper = styled.div`
  position: relative;
  margin: 0 17px;
  width: ${RESOURCE_WIDTH}px;
  min-height: 83px;
  display: inline-block;
  vertical-align: top;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  background-color: #fff;
  cursor: pointer;

  &:hover {
    .header {
      color: #ffffff;
      background-color: #5b6e95;
    }
  }

  &.active {
    box-shadow: 0 6px 12px rgba(58, 69, 92, 0.16);

    .header {
      color: #ffffff;
      background-color: #296dff;
    }
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
`;

const Footer = styled.div`
  display: flex;
`;

export interface SingleNodeProps {
  node: TaskSingleNode;
  className?: string;
  readOnly?: boolean;
}

export const SingleNode: FC<SingleNodeProps> = ({className, node}) => {
  // const {task} = useContext(ViewerContext);

  let active = node.stage === 'in-progress';

  // let {before, after, footer, body} = editor.nodeRenderDescriptor['singleNode'];

  return (
    <Container>
      {/* {before?.length ? (
        <BeforeWrapper>
          {before.reduce(
            (reactNode, component) =>
              createElement(component, {node, editor, prevChildren: reactNode}),
            <></>,
          )}
        </BeforeWrapper>
      ) : undefined} */}
      <Wrapper
        className={classnames([
          className,
          {
            active,
          },
        ])}
      >
        <Header node={node} />
        <Body>
          {/* {body?.reduce(
            (reactNode, component) =>
              createElement(component, {node, editor, prevChildren: reactNode}),
            <></>,
          )} */}
        </Body>

        <Footer>
          {/* {footer?.reduce(
            (reactNode, component) =>
              createElement(component, {node, editor, prevChildren: reactNode}),
            <></>,
          )} */}
        </Footer>
      </Wrapper>
      {/* {after?.length ? (
        <AfterWrapper>
          {after.reduce(
            (reactNode, component) =>
              createElement(component, {node, editor, prevChildren: reactNode}),
            <></>,
          )}
        </AfterWrapper>
      ) : undefined} */}
    </Container>
  );
};
