import {BranchesNode} from '@magicflow/core';
import {Dict} from 'tslang';

import {
  getBranchesDefinition,
  getFlowDefinition,
  getNodeDefinition,
} from '../../utils';
import {TaskFlow, TaskFlowMetadata} from '../flow';
import {Task, TaskStage} from '../task';

import {ITaskNodeMetadata, TaskNode, TaskNodeId} from './node';
import {TaskSingleNode} from './single';

export interface TaskBranchesNodeMetadata
  extends ITaskNodeMetadata,
    Magicflow.TaskBranchesNodeMetadataExtension {
  type: 'branchesNode';
  flows: TaskFlowMetadata[];
}

export class TaskBranchesNode {
  get id(): TaskNodeId {
    return this.metadata.id;
  }

  get stage(): TaskStage {
    if (this.blocked) {
      return 'none';
    }

    if (this.broken) {
      return 'none';
    }

    if (this.ignored) {
      return 'done';
    }

    let stageSet = new Set<TaskStage>(this.flows.map(flow => flow.stage));

    if (stageSet.size === 1) {
      return Array.from(stageSet.values())[0];
    }

    if (stageSet.has('terminated')) {
      return 'terminated';
    }

    if (stageSet.has('in-progress')) {
      return 'in-progress';
    }

    return 'none';
  }

  get broken(): boolean {
    return !!this.task.runtime.nodeBroken?.(this);
  }

  get ignored(): boolean {
    return !!this.task.runtime.nodeIgnored?.(this);
  }

  get nextNodes(): TaskNode[] {
    let {nexts = []} = this.metadata;

    let task = this.task;
    let stage = this.stage;
    let blocked = this.blocked || stage === 'none' || stage === 'in-progress';
    let inputs = this.outputs;

    let {nodeNextContinueAble} = task.runtime;

    return nexts.map(node => {
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

  // 此节点所能抵达的第一个未完成节点
  get leafNodes(): TaskNode[] {
    if (this.stage !== 'done') {
      return [this];
    }

    return this.nextNodes.flatMap(node => node.leafNodes);
  }

  get outputs(): Dict<any> {
    if (this.ignored || this.stage !== 'done') {
      return this.inputs;
    }

    return this.flows[this.flows.length - 1].outputs;
  }

  get flows(): TaskFlow[] {
    let {flows = []} = this.metadata;

    let task = this.task;
    let blocked = this.blocked;
    let inputs = this.inputs;

    let taskFlows: TaskFlow[] = [];

    for (let flow of flows) {
      let taskFlow = new TaskFlow(
        task,
        getFlowDefinition(task, flow.definition)!,
        flow,
        blocked,
        inputs,
      );

      inputs = taskFlow.outputs;
      taskFlows.push(taskFlow);
    }

    return taskFlows;
  }

  constructor(
    readonly task: Task,
    readonly definition: BranchesNode,
    readonly metadata: TaskBranchesNodeMetadata,
    readonly blocked: boolean,
    readonly inputs: Dict<any>,
  ) {}
}
