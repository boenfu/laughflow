export * from './task';
export * from './core';

declare global {
  namespace Magicflow {
    interface TaskMetadataExtension {}

    interface TaskNodeMetadataExtension {}

    interface TaskJointMetadataExtension {}

    interface TaskLeafMetadataExtension {}
  }
}
