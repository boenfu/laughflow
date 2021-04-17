import {
  IOutputsEntity,
  Procedure,
  ProcedureDefinition,
  ProcedureId,
} from '@magicflow/procedure';
import {cloneDeep} from 'lodash-es';
import {Dict, Nominal} from 'tslang';

import {Operator} from '../operators';
import {flatFlow, getFlowDefinition} from '../utils';

import {TaskFlow, TaskFlowMetadata} from './flow';
import {
  TaskBranchesNode,
  TaskBranchesNodeMetadata,
  TaskNode,
  TaskNodeMetadata,
  TaskSingleNode,
  TaskSingleNodeMetadata,
} from './node';
import {ITaskRuntime} from './runtime';

export type TaskId = Nominal<string, 'task:id'>;

export type TaskStage = 'none' | 'in-progress' | 'done' | 'terminated';

export interface TaskMetadata
  extends Magicflow.TaskMetadataExtension,
    IOutputsEntity {
  id: TaskId;
  definition: ProcedureId;
  stage: TaskStage;
  start: TaskFlowMetadata;
}

export class Task {
  get id(): TaskId {
    return this.metadata.id;
  }

  get definition(): ProcedureDefinition {
    return this.procedure.definition;
  }

  get stage(): TaskStage {
    return this.startFlow.stage;
  }

  get ableToBeStart(): boolean {
    let {startAble} = this.runtime;

    if (!startAble) {
      return true;
    }

    return startAble(this);
  }

  get startFlow(): TaskFlow {
    let {start} = this.metadata;
    let blocked = !this.ableToBeStart;

    return new TaskFlow(
      this,
      getFlowDefinition(this, start.definition)!,
      start,
      blocked,
      this.outputs,
    );
  }

  get outputs(): Dict<any> {
    let {outputs = {}} = this.metadata;

    let {preloadOutputs} = this.runtime;

    return {
      ...outputs,
      ...preloadOutputs?.(this),
    };
  }

  get flattenNodes(): TaskSingleNode[] {
    return flatFlow(this.startFlow);
  }

  constructor(
    readonly procedure: Procedure,
    readonly metadata: TaskMetadata,
    readonly runtime: ITaskRuntime = {},
  ) {}

  next(operator?: Operator): Task {
    return operator
      ? new Task(
          this.procedure,
          operator(correctionTaskMetadata(this)),
          this.runtime,
        ).next()
      : new Task(this.procedure, correctionTaskMetadata(this), this.runtime);
  }
}

function correctionTaskMetadata(task: Task): TaskMetadata {
  let {stage, start, ...rest} = task.metadata;
  // eslint-disable-next-line @mufan/explicit-return-type
  let {next = metadata => metadata} = task.runtime;

  return next({
    stage: task.stage,
    start: correctionTaskFlowMetadata(task.startFlow),
    ...cloneDeep(rest),
  });
}

function correctionTaskFlowMetadata(flow: TaskFlow): TaskFlowMetadata {
  let {stage, starts, ...rest} = flow.metadata;

  return {
    stage: flow.stage,
    starts: flow.startNodes.map(correctionTaskNodeMetadata),
    ...cloneDeep(rest),
  };
}

function correctionTaskNodeMetadata(node: TaskNode): TaskNodeMetadata {
  return node instanceof TaskSingleNode
    ? correctionTaskSingleNodeMetadata(node)
    : correctionTaskBranchesNodeMetadata(node);
}

function correctionTaskSingleNodeMetadata(
  node: TaskSingleNode,
): TaskSingleNodeMetadata {
  let {stage, nexts, ...rest} = node.metadata;
  // eslint-disable-next-line @mufan/explicit-return-type
  let {nextNode = metadata => metadata} = node.task.runtime;

  return nextNode({
    stage: node.stage,
    nexts: node.nextNodes?.map(correctionTaskNodeMetadata),
    ...cloneDeep(rest),
  });
}

function correctionTaskBranchesNodeMetadata(
  node: TaskBranchesNode,
): TaskBranchesNodeMetadata {
  let {stage, flows, nexts, ...rest} = node.metadata;

  return {
    stage: node.stage,
    flows: node.flows.map(correctionTaskFlowMetadata),
    nexts: node.nextNodes?.map(correctionTaskNodeMetadata),
    ...cloneDeep(rest),
  };
}
