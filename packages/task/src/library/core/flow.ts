import {Flow, FlowId, IOutputsEntity} from '@magicflow/procedure';
import {Dict, Nominal} from 'tslang';

import {getBranchesDefinition, getNodeDefinition} from '../utils';

import {
  TaskBranchesNode,
  TaskNode,
  TaskNodeMetadata,
  TaskSingleNode,
} from './node';
import {Task, TaskStage} from './task';

export type TaskFlowId = Nominal<string, 'task-flow:id'>;

export interface TaskFlowMetadata
  extends Magicflow.TaskFlowMetadataExtension,
    IOutputsEntity {
  id: TaskFlowId;
  definition: FlowId;
  stage: TaskStage;
  starts: TaskNodeMetadata[];
}

export class TaskFlow {
  get id(): TaskFlowId {
    return this.metadata.id;
  }

  get stage(): TaskStage {
    if (this.blocked) {
      return 'none';
    }

    let broken = true;
    let stageSet = new Set<TaskStage>();

    for (let node of this.starts) {
      broken &&= node.broken;

      for (let leafNode of node.leafNodes) {
        stageSet.add(leafNode.stage);
      }
    }

    if (broken) {
      return 'done';
    }

    if (stageSet.size === 1) {
      return Array.from(stageSet.values())[0];
    }

    if (stageSet.has('terminated')) {
      return 'terminated';
    }

    if (stageSet.has('in-progress')) {
      return 'in-progress';
    }

    // 非根 flow 具有自动开始的特性
    return this.root ? 'none' : 'in-progress';
  }

  get starts(): TaskNode[] {
    let {starts} = this.metadata;

    let task = this.task;
    let blocked = this.blocked;
    // 同一个 Flow 的多个开始 inputs 应该一致
    let inputs = this.inputs;
    let {nodeNextContinueAble} = task.runtime;

    return starts.map(node => {
      let block =
        blocked ||
        !!(
          nodeNextContinueAble && !nodeNextContinueAble(this, node.definition)
        );

      return node.type === 'singleNode'
        ? new TaskSingleNode(
            task,
            getNodeDefinition(task, node.definition)!,
            node,
            block,
            inputs,
          )
        : new TaskBranchesNode(
            task,
            getBranchesDefinition(task, node.definition)!,
            node,
            block,
            inputs,
          );
    });
  }

  get leaves(): TaskNode[] {
    return this.starts.flatMap(node => node.leafNodes);
  }

  get outputs(): Dict<any> {
    let {outputs = {}} = this.metadata;

    return Object.assign(
      {},
      ...this.leaves.map(node => node.outputs),
      this.stage === 'done' ? outputs : {},
    );
  }

  get root(): boolean {
    return this === this.task.startFlow;
  }

  constructor(
    readonly task: Task,
    readonly definition: Flow,
    readonly metadata: TaskFlowMetadata,
    readonly blocked: boolean,
    readonly inputs: Dict<any>,
  ) {}
}
