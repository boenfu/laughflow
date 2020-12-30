import {Bezier, BezierStroke} from 'rc-bezier';
import React, {FC} from 'react';
import styled from 'styled-components';

import {ProcedureChildrenType, ProcedureEdge} from '../../core';

import {useAddMark} from './@add';

const STROKE_DEFAULT: BezierStroke = {color: '#C8CDD8', width: 1};

const ARC_RADIUS_DEFAULT = 8;

const Wrapper = styled(Bezier)`
  &.connection-line {
    display: inline-block;
    width: 0px !important;
    height: 0px !important;
    cursor: pointer;
  }
`;

export interface ConnectionLineProps {
  type: ProcedureChildrenType;
  edge: ProcedureEdge;
  /**
   * 只有边际的两个元素才会绘制向下的圆弧
   */
  boundary?: boolean;
}

export const ConnectionLine: FC<ConnectionLineProps> = ({
  type,
  edge,
  boundary,
}) => {
  const [stroke, Mark] = useAddMark(edge);

  return (
    <Wrapper
      className="connection-line"
      stroke={stroke || STROKE_DEFAULT}
      startNode={['parent', 'previousSibling']}
      endNode={
        type === 'node' ? ['nextSibling', 'firstChild'] : 'previousSibling'
      }
      marks={[Mark]}
      generatePath={points => {
        let start = points[0];
        let end = points[points.length - 1];
        let r = ARC_RADIUS_DEFAULT;

        if (start.x === end.x) {
          return `M ${start.x},${start.y} V ${end.y}`;
        }

        let d = end.x > start.x ? 1 : -1;

        return `M ${start.x},${start.y} V ${
          (start.y + end.y) / 2 - r
        } A ${r},${r},0,0,${d === 1 ? '0' : '1'},${start.x + r * d},${
          (start.y + end.y) / 2
        } H ${
          boundary
            ? ` ${end.x - r * d} A ${r},${r},0,0,${d === 1 ? '1' : '0'},${
                end.x
              },${(start.y + end.y) / 2 + r}`
            : end.x
        } V ${end.y}`;
      }}
    />
  );
};
