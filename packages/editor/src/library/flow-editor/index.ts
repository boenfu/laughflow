export * from './editor';
export * from './leaf';
export * from './node';
export * from './@connection-line';
export * from './@common';
export * from './flow';
export * from './../flow-context';

declare global {
  namespace Magicflow {
    interface SingleNodeExtension {
      displayName?: string;
    }
  }
}
