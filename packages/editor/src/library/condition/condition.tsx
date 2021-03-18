import React from 'react';

import {INodePlugin, IPlugin} from '../plugin';

declare global {
  namespace Magicflow {
    interface NodeMetadataExtension {
      condition?: boolean;
    }
  }
}

export class ConditionPlugin implements IPlugin {
  readonly name = 'condition';

  nodes: INodePlugin[] = [
    {
      render: {
        before() {
          return <div />;
        },
        body() {
          return <div />;
        },
        bodyAppend: true,
      },
    },
  ];
}
