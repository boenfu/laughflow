import {ProcedureTreeNode} from '@magicflow/procedure';
import classNames from 'classnames';
import React, {CSSProperties, FC, Fragment} from 'react';
import styled from 'styled-components';

import {ConnectionLine, LINE_HEIGHT_DEFAULT} from '../@connection-line';
import {Leaf} from '../leaf';

import {BranchesNode} from './@branches';
import {LinkNode} from './@link';
import {SingleNode} from './@single';

export interface NodeProps {
  node: ProcedureTreeNode;
  className?: string;
  readOnly?: boolean;
  style?: CSSProperties;
}

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

export const Node: FC<NodeProps> = ({style, node}) => {
  if (node.left) {
    return <LinkNode node={node} />;
  }

  let nexts = node.nexts;

  return (
    <Container style={style}>
      {node.type === 'singleNode' ? (
        <SingleNode node={node} />
      ) : (
        <BranchesNode node={node} />
      )}

      <Row className={classNames({multi: nexts.length > 1})}>
        {nexts.length ? (
          nexts.map((next, index, array) => {
            return (
              <Fragment key={`${next.id}-${index}`}>
                <ConnectionLine
                  startNode={['parent', 'previousSibling']}
                  first={index === 0 && array.length > 1}
                  last={index === array.length - 1 && array.length > 1}
                />
                <Node node={next} />
              </Fragment>
            );
          })
        ) : (
          <>
            <ConnectionLine startNode={['parent', 'previousSibling']} />
            <Leaf />
          </>
        )}
      </Row>
    </Container>
  );
};
