import {Bezier, BezierProps, BezierStroke} from 'rc-bezier';
import React, {FC} from 'react';
import styled from 'styled-components';

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
    z-index: 1;
    pointer-events: all !important;
  }
`;

export interface ConnectionLineProps extends BezierProps {
  first?: boolean;
  last?: boolean;
}

export const ConnectionLine: FC<ConnectionLineProps> = ({
  first,
  last,
  startNode,
  endNode,
  placement,
  marks,
}) => {
  return (
    <Wrapper
      className="connection-line"
      stroke={STROKE_DEFAULT}
      startNode={startNode}
      endNode={endNode}
      placement={placement}
      observer={{
        attributes: true,
        subtree: true,
      }}
      marks={marks}
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
          } A ${radius},${radius},0,0,${direction === 1 ? '1' : '0'},${end.x},${
            midline + radius
          } V ${end.y}`;
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
      }}
    />
  );
};
