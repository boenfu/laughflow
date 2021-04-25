/* eslint-disable @mufan/scoped-modules */
export * from './flow-editor';
export * from './procedure-editor';
export * from './flow-context';

declare global {
  namespace Magicflow {
    interface SingleNodeExtension {
      displayName?: string;
    }
  }
}
