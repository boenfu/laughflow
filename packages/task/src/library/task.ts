import {NodeId, ProcedureDefinition, TaskMetadata} from '@magicflow/core';

export class Task {
  constructor(
    readonly definition: ProcedureDefinition,
    private metadata?: TaskMetadata,
  ) {}

  startup(nodeId: NodeId): void {
    if (this.metadata) {
      throw Error('Task has started');
    }
  }
}
