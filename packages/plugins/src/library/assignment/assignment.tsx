import {INodePlugin, IPlugin} from '@magicflow/editor';
import {ApprovalSolid, UserSolid} from '@magicflow/icons';
import React from 'react';

declare global {
  namespace Magicflow {
    interface SingleNodeExtension {
      assignment?: boolean;
    }
  }
}

export class AssignmentPlugin implements IPlugin {
  readonly name = 'assignment';

  nodes: INodePlugin[] = [
    {
      render: {
        headRight(metadata) {
          return metadata.node.displayName ? <ApprovalSolid /> : <></>;
        },
        footer(metadata) {
          return metadata.node.assignment ? <UserSolid /> : <></>;
        },
      },
    },
  ];
}
