import {LeafId, NodeId, ProcedureDefinition} from '@magicflow/core';
import {createId} from '@magicflow/procedure';

import {TaskLeafMetadata, TaskMetadata, TaskNodeMetadata} from './core';

export class Task {
  readonly nodeMetadataMap = new Map(
    this.definition.nodes.map(node => [node.id, node]),
  );

  get metadata(): TaskMetadata | undefined {
    return this._metadata;
  }

  constructor(
    readonly definition: ProcedureDefinition,
    private _metadata?: TaskMetadata,
  ) {}

  startup(nodeId: NodeId): void {
    if (this._metadata) {
      throw Error('Task has started');
    }

    let nodeMetadataMap = this.nodeMetadataMap;

    let visitedEdge = new Set<`${NodeId}-${NodeId | LeafId}`>();

    let startTaskNode = buildTaskNode(nodeId);

    let pendingBuildNodes: TaskNodeMetadata[] = [startTaskNode];

    let taskNodes: TaskNodeMetadata[] = [startTaskNode];
    let taskLeaves: TaskLeafMetadata[] = [];

    while (pendingBuildNodes.length) {
      let buildingNode = pendingBuildNodes.shift()!;

      buildingNode.nexts = buildingNode.nexts || [];

      let nodeMetadata = nodeMetadataMap.get(buildingNode.definition);

      if (!nodeMetadata) {
        throw Error(
          `Not found node metadata by id '${buildingNode.definition}'`,
        );
      }

      for (let nextMetadata of nodeMetadata.nexts || []) {
        let edge = `${nodeMetadata.id}-${nextMetadata.id}`;

        if (visitedEdge.has(edge)) {
          continue;
        }

        visitedEdge.add(edge);

        if (nextMetadata.type === 'node') {
          let node = buildTaskNode(nextMetadata.id);

          taskNodes.push(node);
          pendingBuildNodes.push(node);

          buildingNode.nexts.push({
            type: 'node',
            id: node.id,
          });
        } else {
          let leaf = buildTaskLeaf(nextMetadata.id);

          taskLeaves.push(leaf);

          buildingNode.nexts.push({
            type: 'leaf',
            id: leaf.id,
          });
        }
      }
    }

    this._metadata = {
      id: createId(),
      definition: this.definition.id,
      startNode: startTaskNode.id,
      nodes: taskNodes,
      leaves: taskLeaves,
    };
  }

  buildViewState(): void {
    // 检查进行中节点
    // 检查 terminated leaf
    // 检查 all done leaf
  }
}

function buildTaskNode(definition: NodeId): TaskNodeMetadata {
  return {
    id: createId(),
    definition,
  };
}

function buildTaskLeaf(definition: LeafId): TaskLeafMetadata {
  return {
    id: createId(),
    definition,
  };
}
