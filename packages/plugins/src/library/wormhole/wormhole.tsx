import {IPlugin} from '@magicflow/core';
import {ConnectNode} from '@magicflow/icons';

import {WormholeLeaf} from './@leaf';

declare module '@magicflow/core' {
  interface NodeMetadata {
    // verified: boolean;
  }
}

export const wormhole: IPlugin<'wormhole'> = {
  leaves: [
    {
      type: 'wormhole',
      render: WormholeLeaf,
      selectorRender: ConnectNode,
    },
  ],
};
