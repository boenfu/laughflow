export * from './task';
export * from './core';

declare global {
  namespace Magicflow {
    interface TaskMetadataExtension {}

    interface TaskFlowMetadataExtension {}

    interface TaskNodeMetadataExtension {}

    interface TaskBranchesNodeMetadataExtension {}
  }
}
