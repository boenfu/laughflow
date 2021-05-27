export * from './flow-context';
export * from './flow-viewer';
export * from './procedure-editor';
export * from './procedure-viewer';
export * from './flow-skeleton';
export * from './flow-editor';

declare global {
  namespace Magicflow {
    interface SingleNodeExtension {
      displayName?: string;
    }
  }
}
