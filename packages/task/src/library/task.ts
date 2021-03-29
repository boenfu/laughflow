import {NodeId, NodeMetadata, ProcedureDefinition} from '@magicflow/core';
import {createId} from '@magicflow/procedure';
import {Patch, applyPatches, enableAllPlugins, produce} from 'immer';
import {Dict} from 'tslang';

import {TaskMetadata, TaskNodeMetadata, TaskNodeStage} from './core';

enableAllPlugins();

interface Context {
  targetStage?: TaskNodeStage;
  inputs?: any;
  definition?: NodeMetadata;
}

type NextProcessor = (
  node: TaskNodeMetadata,
  context: Context,
) => TaskNodeMetadata;

export class Task {
  readonly nodeMetadataMap = new Map(
    this.definition.nodes.map(node => [node.id, node]),
  );

  readonly nodesMap = new Map(
    this.metadata?.nodes.map(node => [node.id, node]),
  );

  get metadata(): TaskMetadata | undefined {
    return this._metadata;
  }

  get startNodes(): TaskNode[] {
    let metadata = this.metadata;

    if (!metadata) {
      return [];
    }

    let nodesMap = this.nodesMap;

    return metadata.startIds.map(id => {
      let metadata = nodesMap.get(id);

      if (!metadata) {
        // throw
        throw Error('');
      }

      return new TaskNode(
        this.nodeMetadataMap.get(metadata.definition)!,
        nodesMap.get(id)!,
        this,
        metadata?.outputs || {},
      );
    });
  }

  constructor(
    readonly definition: ProcedureDefinition,
    private processors: NextProcessor[],
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
      stage: 'none',
      startIds: [],
      nodes: [],
      outputs: definition?.outputs,
    };

    //  beforeStartup(taskMetadata, definition):void;

    for (let node of nodeIds) {
      let nodeDefinition = nodeMetadataMap.get(node);

      let metadata: TaskNodeMetadata = {
        id: createId(),
        definition: node,
        stage: 'none',
      };

      metadata = {
        ...this.next(
          {...metadata},
          {
            targetStage: 'none',
            inputs: taskMetadata.outputs,
            definition: nodeDefinition,
          },
        ),
        id: metadata.id,
        definition: metadata.definition,
      };

      taskMetadata.startIds.push(metadata.id);
      taskMetadata.nodes.push(metadata);
    }

    // afterStartup(taskMetadata, definition):void;

    this._metadata = taskMetadata;
  }

  next(node: TaskNodeMetadata, context: Context): TaskNodeMetadata {
    return this.processors.reduce(
      (node, processor) => processor(node, context),
      node,
    );
  }
}

export class TaskNode {
  get nexts(): (TaskNode | TaskJoint)[] {
    let nodeMetadataMap = this.task.nodeMetadataMap;
    let nodesMap = this.task.nodesMap;

    return (
      this.metadata.nexts?.map(next => {
        if (next.type === 'node') {
          let metadata = nodesMap.get(next.id);

          if (!metadata) {
            // throw
            throw Error('');
          }

          return new TaskNode(
            nodeMetadataMap.get(metadata.definition)!,
            nodesMap.get(next.id)!,
            this.task,
            this.outputs,
          );
        } else {
          return new TaskJoint();
        }
      }) || []
    );
  }

  get outputs(): Dict<any> {
    return {...this.inputs, ...this.metadata.outputs};
  }

  constructor(
    readonly definition: NodeMetadata,
    private metadata: TaskNodeMetadata,
    private task: Task,
    private inputs: Dict<any>,
  ) {}
}

export class TaskJoint {
  // constructor(
  // readonly definition: NodeMetadata,
  // private metadata: TaskJointMetadata,
  // private task: Task,
  // private inputs: Dict<any>,
  // ) {}
}
