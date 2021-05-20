import {Plus, PlusSmall, Union} from '@magicflow/icons';
import {useBoolean} from 'ahooks';
import classNames from 'classnames';
import {Bezier, BezierPoint, BezierProps, BezierStroke, Mark} from 'rc-bezier';
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
  display: inline-block;
  width: 0px !important;
  height: 0px !important;
  cursor: pointer;

  .rc-bezier-mark-wrapper {
    height: 16px;
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

const Menu = styled.div`
  opacity: 0;
  pointer-events: none;

  position: absolute;
  left: 100%;
  top: -8px;
  padding-left: 8px;

  ${transition(['opacity'])}
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 28px;
  font-size: 12px;
  line-height: 16px;
  padding: 6px 12px;
  background-color: #fafafa;

  ${transition(['transform'])}

  svg {
    margin-right: 6px;
  }

  & + & {
    margin-top: 8px;
  }

  &:nth-child(1) {
    transform: translateX(-8px);
  }

  &:nth-child(2) {
    transform: translateX(-12px);
  }
`;

const PlusButtonWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: flex-start;
  justify-content: center;
  background-color: #e5e7eb;

  &.active {
    ${PlusButtonIcon} {
      color: #296dff;
      border-color: #296dff;
      transform: rotate(45deg);
    }

    ${Menu} {
      opacity: 1;
      pointer-events: all;

      ${MenuItem} {
        transform: translateX(0);
      }
    }
  }

  &.start {
    transform: translateY(22px);
  }

  &.end {
    transform: translateY(-22px);
  }
`;

const PlusButton: FC<{className?: string}> = ({className}) => {
  const [active, {toggle}] = useBoolean();

  const onClick = (event: MouseEvent): void => {
    event.stopPropagation();
    toggle();
  };

  const onAddNode = (): void => {};

  const onAddBranchesNode = (): void => {};

  return (
    <PlusButtonWrapper
      className={classNames({active}, className)}
      onClick={onClick}
    >
      <PlusButtonIcon />
      <Menu>
        <MenuItem onClick={onAddNode}>
          <Plus /> 新建普通节点
        </MenuItem>
        <MenuItem onClick={onAddBranchesNode}>
          <Union /> 新建分支节点
        </MenuItem>
      </Menu>
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
    multiMark?: boolean;
  }
> = ({next, first, last, startNode, endNode, placement, multiMark}) => {
  let marks: Mark[] =
    multiMark !== undefined
      ? !multiMark
        ? [
            {
              key: 'single',
              render: <PlusButton />,
              position: 0.5,
            },
          ]
        : first
        ? [
            {
              key: 'start',
              render: <PlusButton className="start" />,
              position: 0,
            },
            {
              key: 'end',
              render: <PlusButton className="end" />,
              position: 1,
            },
          ]
        : last
        ? [
            {
              key: 'end',
              render: <PlusButton className="end" />,
              position: 1,
            },
          ]
        : [
            {
              key: 'end',
              render: <PlusButton className="end" />,
              position: 1,
            },
          ]
      : [];

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
