export * from './flow-viewer';
export * from './procedure-editor';
export * from './flow-skeleton';
export * from './flow-editor';

declare global {
  namespace laughflow {
    interface SingleNodeExtension {
      displayName?: string;
    }
  }
}
