import {ProcedureFlow, ProcedureTreeNode} from '@magicflow/procedure';
import React, {FC} from 'react';

import {
  ConnectionLine as _ConnectionLine,
  ConnectionLineProps,
  Mark,
} from '../@common';

export const ConnectionLine: FC<
  ConnectionLineProps & {
    start: ProcedureFlow | ProcedureTreeNode;
    /**
     * false 不展示 mark
     */
    next?: ProcedureTreeNode | false;
  }
> = ({start, next, ...props}) => {
  return (
    <_ConnectionLine
      marks={
        next !== false
          ? [
              {
                key: 'mark',
                position: 0.5,
                render: <Mark {...{start, next}} />,
              },
            ]
          : []
      }
      {...props}
    />
  );
};
