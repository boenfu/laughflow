import {IPlugin} from '@magicflow/core';

declare module '@magicflow/core' {
  interface LeafMetadata {
    approval?: boolean;
  }
}

export class ApprovalPlugin implements IPlugin {}
