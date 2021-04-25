export * from './flow-context';
export * from './flow-editor';
export * from './flow-viewer';
export * from './procedure-editor';
export * from './procedure-viewer';

declare global {
  namespace Magicflow {
    interface SingleNodeExtension {
      displayName?: string;
    }
  }
}
