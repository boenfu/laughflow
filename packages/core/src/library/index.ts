export * from './leaf';
export * from './node';
export * from './procedure';
export * from './joint';
export * from './ref';

declare global {
  namespace Magicflow {
    interface ProcedureMetadataExtension {}

    interface NodeMetadataExtension {}

    interface LeafMetadataExtension {}

    interface JointMetadataExtension {}
  }
}
