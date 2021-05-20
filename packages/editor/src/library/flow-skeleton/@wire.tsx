import {PlusSmall} from '@magicflow/icons';
import {useBoolean} from 'ahooks';
import classNames from 'classnames';
import {Bezier, BezierPoint, BezierProps, BezierStroke} from 'rc-bezier';
import React, {FC, MouseEvent} from 'react';
import styled from 'styled-components';

import {Icon, transition} from '../@common';

import {IFlow, INode} from './flow-skeleton';

export const LINE_HEIGHT_DEFAULT = 48;

export const LINE_HEIGHT_LEAF = 20;

const STROKE_DEFAULT: BezierStroke = {
  color: '#C8CDD8',
  width: 1,
};

const ARC_RADIUS_DEFAULT = 10;

const Wrapper = styled(Bezier)`
  height: 0 !important;

  &.connection-line {
    display: inline-block;
    width: 0px !important;
    height: 0px !important;
    cursor: pointer;
  }

  * {
    z-index: 1;
  }
`;

const PlusButtonIcon = styled(PlusSmall)`
  ${Icon};

  box-sizing: border-box;
  font-size: 16px;
  color: #848b9a;
  border: 1px solid ${STROKE_DEFAULT.color};
  background-color: transparent;
  ${transition(['color', 'border-color', 'transform'])}
`;

const PlusButtonWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;

  &.active {
    ${PlusButtonIcon} {
      color: #296dff;
      border-color: #296dff;
      transform: rotate(45deg);
    }
  }
`;

const PlusButton: FC = () => {
  const [active, {toggle}] = useBoolean();

  const onClick = (event: MouseEvent): void => {
    event.stopPropagation();
    toggle();
  };

  return (
    <PlusButtonWrapper className={classNames({active})} onClick={onClick}>
      <PlusButtonIcon />
    </PlusButtonWrapper>
  );
};

export interface WireProps extends BezierProps {
  first?: boolean;
  last?: boolean;
}

export const Wire: FC<
  WireProps & {
    start: IFlow | INode;
    /**
     * false 不展示 mark
     */
    next?: INode | false;
  }
> = ({next, first, last, startNode, endNode, placement, marks}) => {
  return (
    <>
      <Wrapper
        className="wire"
        stroke={STROKE_DEFAULT}
        startNode={startNode}
        endNode={endNode}
        placement={placement}
        observer={{
          attributes: true,
          subtree: true,
        }}
        marks={marks}
        generatePath={getGeneratePath({first, last})}
      />
      {next === undefined ? <PlusButton /> : undefined}
    </>
  );
};

function getGeneratePath({
  first,
  last,
}: {
  first?: boolean;
  last?: boolean;
}): (points: BezierPoint[]) => string {
  return (points: BezierPoint[]): string => {
    let start = points[0];
    let end = points[points.length - 1];

    if (start.x === end.x) {
      return `M ${start.x},${start.y} V ${end.y}`;
    }

    let radius = ARC_RADIUS_DEFAULT;
    let direction = end.x > start.x ? 1 : -1;
    let midline = start.y + LINE_HEIGHT_DEFAULT;

    if (first) {
      return `M ${start.x},${start.y} V ${
        midline - radius
      } A ${radius},${radius},0,0,${direction === 1 ? '0' : '1'},${
        start.x + radius * direction
      },${midline} H ${end.x - radius * direction} A ${radius},${radius},0,0,${
        direction === 1 ? '1' : '0'
      },${end.x},${midline + radius} V ${end.y}`;
    }

    if (last) {
      return `M ${start.x},${midline - radius} A ${radius},${radius},0,0,${
        direction === 1 ? '0' : '1'
      },${start.x + radius * direction},${midline} H ${
        end.x - radius * direction
      } A ${radius},${radius},0,0,${direction === 1 ? '1' : '0'},${end.x},${
        midline + radius
      } V ${end.y}`;
    }

    return `M ${end.x},${midline} V ${end.y}`;
  };
}
