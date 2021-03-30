import {Flow, Node, NodeId} from '@magicflow/core';
import {createId} from '@magicflow/procedure';
import {enableAllPlugins, produce} from 'immer';
import {isEqual} from 'lodash-es';

import {TaskMetadata, TaskNodeMetadata, TaskNodeStage} from './core';

enableAllPlugins();

interface Context {
  targetStage?: TaskNodeStage;
  inputs?: any;
  definition?: Node;
}

type Processor = (node: TaskNodeMetadata, context: Context) => TaskNodeMetadata;

export class Task {
  readonly nodeMetadataMap = new Map(
    this.definition.nodes.map(node => [node.id, node]),
  );

  get metadata(): TaskMetadata | undefined {
    return this._metadata;
  }

  constructor(
    readonly definition: Flow,
    private processors: Processor[],
    private _metadata?: TaskMetadata,
  ) {}

  startup(nodeIds: NodeId[]): void {
    if (this._metadata) {
      throw Error('Task has started');
    }

    let definition = this.definition;
    let nodeMetadataMap = this.nodeMetadataMap;

    let taskMetadata: TaskMetadata = {
      id: createId(),
      definition: definition.id,
      stage: 'in-progress',
      startIds: [],
      nodes: [],
      outputs: definition?.outputs,
    };

    //  beforeStartup(taskMetadata, definition):void;

    for (let node of nodeIds) {
      let nodeDefinition = nodeMetadataMap.get(node);

      if (!nodeDefinition) {
        continue;
      }

      let metadata: TaskNodeMetadata = {
        id: createId(),
        definition: node,
        stage: 'in-progress',
      };

      taskMetadata.startIds.push(metadata.id);
      taskMetadata.nodes.push(metadata);
    }

    // afterStartup(taskMetadata, definition):void;

    this.setMetadata(taskMetadata);

    this.nextState();
  }

  nextState(handler?: (metadata: TaskMetadata) => void): void {
    if (!this._metadata) {
      throw Error('Task not started');
    }

    let metadata = await produce(this._metadata, async metadata => {
      // hook: preload inputs,
      // 如标签提供的预置变量, 流程的预置 outputs 合并起来
      // 存入 metadata outputs

      handler?.(metadata);

      let nodesMap = new Map(this.metadata?.nodes.map(node => [node.id, node]));

      for (let startId of this._metadata?.startIds || []) {
        let startMetadata = nodesMap.get(startId);

        if (!startMetadata) {
          throw Error('todo');
        }

        let pendingCheckNodes = [startMetadata];

        while (pendingCheckNodes.length) {
          let nodeMetadata = pendingCheckNodes.shift()!;
        }
      }
    });

    if (isEqual(metadata, this._metadata)) {
      return;
    }

    this.setMetadata(metadata);

    // after task change
  }

  setMetadata(metadata: TaskMetadata): void {
    this._metadata = metadata;
  }
}
