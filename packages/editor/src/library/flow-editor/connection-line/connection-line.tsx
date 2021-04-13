import {ProcedureFlow, ProcedureTreeNode} from '@magicflow/procedure';
import {Bezier, BezierProps, BezierStroke} from 'rc-bezier';
import React, {FC} from 'react';
import styled from 'styled-components';

import {Mark} from './@mark';

export const LINE_HEIGHT_DEFAULT = 48;

const STROKE_DEFAULT: BezierStroke = {color: '#C8CDD8', width: 1};

const ARC_RADIUS_DEFAULT = 8;

const Wrapper = styled(Bezier)`
  &.connection-line {
    display: inline-block;
    width: 0px !important;
    height: 0px !important;
    cursor: pointer;
  }

  * {
    pointer-events: all !important;
  }
`;

const EndWrapper = styled.div`
  display: inline-block;
  text-align: center;
`;

export interface ConnectionLineProps extends BezierProps {
  start: ProcedureFlow | ProcedureTreeNode;
  /**
   * false: 设置 mark 为 结束元素
   */
  next?: ProcedureTreeNode | false;
  /**
   * 边际的两个元素会绘制向下的圆弧
   */
  first?: boolean;
  last?: boolean;
}

export const ConnectionLine: FC<ConnectionLineProps> = ({
  start,
  next,
  first,
  last,
  startNode,
  endNode,
  placement,
}) => {
  let markAsNext = next === false;

  let markRendering = (
    <Mark {...{start, next: next || undefined, active: markAsNext}} />
  );

  return (
    <>
      <Wrapper
        className="connection-line"
        stroke={STROKE_DEFAULT}
        startNode={startNode}
        endNode={endNode}
        placement={placement}
        marks={
          next !== false
            ? [
                {
                  key: 'mark',
                  position: 0.5,
                  render: markRendering,
                },
              ]
            : []
        }
        observer={{
          attributes: true,
          subtree: true,
        }}
        generatePath={points => {
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
            },${midline} H ${
              end.x - radius * direction
            } A ${radius},${radius},0,0,${direction === 1 ? '1' : '0'},${
              end.x
            },${midline + radius} V ${end.y}`;
          }

          if (last) {
            return `M ${start.x},${
              midline - radius
            } A ${radius},${radius},0,0,${direction === 1 ? '0' : '1'},${
              start.x + radius * direction
            },${midline} H ${
              end.x - radius * direction
            } A ${radius},${radius},0,0,${direction === 1 ? '1' : '0'},${
              end.x
            },${midline + radius} V ${end.y}`;
          }

          return `M ${end.x},${midline} V ${end.y}`;
        }}
      />
      {markAsNext ? <EndWrapper>{markRendering}</EndWrapper> : undefined}
    </>
  );
};
