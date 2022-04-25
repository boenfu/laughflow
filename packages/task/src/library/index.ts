export * from './core';
export * from './operators';
export * from './utils';

declare global {
  namespace laughflow {
    interface TaskMetadataExtension {}

    interface TaskFlowMetadataExtension {}

    interface TaskSingleNodeMetadataExtension {}

    interface TaskBranchesNodeMetadataExtension {}
  }
}
