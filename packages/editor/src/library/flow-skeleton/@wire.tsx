import {Plus, PlusSmall, Union} from '@magicflow/icons';
import {useBoolean, useClickAway} from 'ahooks';
import classNames from 'classnames';
import {Bezier, BezierPoint, BezierProps, BezierStroke, Mark} from 'rc-bezier';
import React, {FC, MouseEvent, createContext, useContext, useRef} from 'react';
import styled from 'styled-components';

import {transition} from '../@common';

import {Action, SuffixToPosition} from './@actions';
import {Icon} from './@common';
import {useSkeletonContext} from './context';
import {IFlow, INode} from './flow-skeleton';

export const LINE_HEIGHT_DEFAULT = 48;

export const LINE_HEIGHT_LEAF = 20;

const STROKE_DEFAULT: BezierStroke = {
  color: '#C8CDD8',
  width: 1,
};

const ARC_RADIUS_DEFAULT = 10;

const Wrapper = styled(Bezier)`
  width: 0px !important;
  height: 0px !important;

  .rc-bezier-mark-wrapper {
    height: 16px;
  }

  * {
    z-index: 1;
  }
`;

const PasteButtonIcon = styled.div`
  width: 16px;
  height: 16px;
  border: 1px dashed #296dff;
  box-sizing: border-box;
  border-radius: 2px;

  &:hover {
    background-color: #296dff;
  }

  ${transition(['background-color', 'border-color'])}
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
  white-space: nowrap;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 28px;
  font-size: 12px;
  line-height: 16px;
  padding: 6px 12px;
  background-color: #fafafa;
  user-select: none;
  cursor: pointer;

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

const MarkWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: flex-start;
  justify-content: center;

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

const WireContext = createContext<Pick<WireProps, 'start' | 'next'>>(
  undefined!,
);

function buildAction(
  type: 'add' | 'move' | 'copy',
  active: INode | undefined,
  start: WireProps['start'],
  next: WireProps['next'],
  prefix: 'node' | 'branches-node' = 'node',
): Action {
  let suffix!: keyof SuffixToPosition;

  if (next) {
    if ('starts' in start) {
      suffix = 'between-flow-and-node';
    } else {
      suffix = 'between-nodes';
    }
  } else {
    if ('starts' in start) {
      suffix = 'after-flow';
    } else {
      suffix = 'after-node';
    }
  }

  return ({
    type: `${prefix}:${type}-${suffix}`,
    target: active,
    position: next ? [start, next] : [start],
  } as unknown) as Action;
}

const PasteButton: FC<{className?: string}> = ({className}) => {
  const {start, next} = useContext(WireContext);
  const {active, activeState, setActiveState, onAction} = useSkeletonContext();
  const notStartState = className !== 'start';

  const onClick = (event: MouseEvent): void => {
    event.stopPropagation();

    onAction?.(
      buildAction(
        activeState === 'moving' ? 'move' : 'copy',
        active as INode,
        start,
        notStartState && next,
      ),
    );

    setActiveState(undefined);
  };

  return (
    <MarkWrapper className={className} onClick={onClick}>
      <PasteButtonIcon />
    </MarkWrapper>
  );
};

const PlusButton: FC<{className?: string}> = ({className}) => {
  const {start, next} = useContext(WireContext);
  const {onAction} = useSkeletonContext();
  // eslint-disable-next-line no-null/no-null
  const ref = useRef<HTMLDivElement>(null);
  const [active, {toggle, setFalse}] = useBoolean();
  const notStartState = className !== 'start';

  const onClick = (event: MouseEvent): void => {
    event.stopPropagation();
    toggle();
  };

  const onAddNode = (): void => {
    onAction?.(buildAction('add', undefined, start, notStartState && next));
  };

  const onAddBranchesNode = (): void => {
    onAction?.(
      buildAction(
        'add',
        undefined,
        start,
        notStartState && next,
        'branches-node',
      ),
    );
  };

  useClickAway(setFalse, ref);

  return (
    <MarkWrapper
      className={classNames({active}, className)}
      style={{
        zIndex: active ? 3 : 2,
      }}
      ref={ref}
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
    </MarkWrapper>
  );
};

export interface WireProps extends BezierProps {
  first?: boolean;
  last?: boolean;

  start: IFlow | INode;
  /**
   * false 不展示 mark
   */
  next?: INode | false;

  multiMark?: boolean;
}

export const Wire: FC<WireProps> = ({
  start,
  next,
  first,
  last,
  startNode,
  endNode,
  placement,
  multiMark,
}) => {
  const {activeState} = useSkeletonContext();

  let Mark =
    activeState === 'moving' || activeState === 'copying'
      ? PasteButton
      : PlusButton;

  let marks: Mark[] =
    multiMark !== undefined
      ? !multiMark
        ? [
            {
              key: 'single',
              render: <Mark />,
              position: 0.5,
            },
          ]
        : first
        ? [
            {
              key: 'start',
              render: <Mark className="start" />,
              position: 0,
            },
            {
              key: 'end',
              render: <Mark className="end" />,
              position: 1,
            },
          ]
        : last
        ? [
            {
              key: 'end',
              render: <Mark className="end" />,
              position: 1,
            },
          ]
        : [
            {
              key: 'end',
              render: <Mark className="end" />,
              position: 1,
            },
          ]
      : [];

  return (
    <WireContext.Provider
      value={{
        start,
        next,
      }}
    >
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
      {next === undefined ? <Mark /> : undefined}
    </WireContext.Provider>
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
    let start = formatPoint(points[0]);
    let end = formatPoint(points[points.length - 1]);

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

function formatPoint({x, y}: BezierPoint): BezierPoint {
  return {
    x: +x.toFixed(0),
    y: +y.toFixed(0),
  };
}
