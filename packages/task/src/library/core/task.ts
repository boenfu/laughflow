/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  Flow,
  FlowId,
  IOutputsEntity,
  Node,
  NodeId,
  Procedure,
  ProcedureDefinition,
  ProcedureId,
} from '@laughflow/procedure';
import {cloneDeep} from 'lodash-es';
import type {Dict, Nominal} from 'tslang';

import type {Operator} from '../operators';
import {flatFlow, getFlowDefinition, initNode, initTask} from '../utils';

import type {TaskFlowMetadata} from './flow';
import {TaskFlow} from './flow';
import type {
  TaskBranchesNode,
  TaskBranchesNodeMetadata,
  TaskNode,
  TaskNodeMetadata,
  TaskSingleNodeMetadata,
} from './node';
import {TaskSingleNode} from './node';
import type {ITaskRuntime} from './runtime';

export type TaskId = Nominal<string, 'task:id'>;

export type TaskStage = 'none' | 'in-progress' | 'done' | 'terminated';

export interface TaskMetadata
  extends laughflow.TaskMetadataExtension,
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
    readonly metadata: TaskMetadata = initTask(procedure.definition),
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
  let {next = (_, metadata) => metadata} = task.runtime;

  return next(task, {
    stage: task.stage,
    start: correctionTaskFlowMetadata(task.startFlow),
    ...cloneDeep(rest),
  });
}

function correctionTaskFlowMetadata(flow: TaskFlow): TaskFlowMetadata {
  let {stage, starts, ...rest} = flow.metadata;

  return {
    stage: flow.stage,
    starts: flow.starts.map(correctionTaskNodeMetadata),
    ...cloneDeep(rest),
  };
}

function correctionTaskNodeMetadata(node: TaskNode): TaskNodeMetadata {
  let nextNodeMetadata =
    node instanceof TaskSingleNode
      ? correctionTaskSingleNodeMetadata(node)
      : correctionTaskBranchesNodeMetadata(node);

  // 由于任务初始化, 重复使用的 node 不会实例化其 nexts
  // 所以在 node unblocked 的时候，就去检查一次是否有需要实例化的 node
  if (
    !('flows' in node) &&
    !node.blocked &&
    node.definition.nexts.length &&
    node.definition.nexts.length !== nextNodeMetadata.nexts?.length
  ) {
    nextNodeMetadata.nexts ||= [];

    let existedNextTimesDict = nextNodeMetadata.nexts.reduce<
      Record<string, number>
    >((nextsTimes, next) => {
      nextsTimes[next.definition] ||= 0;
      nextsTimes[next.definition] += 0;

      return nextsTimes;
    }, {});

    let getNodeDefinition = (nodeId: NodeId): Node | undefined =>
      node.task.procedure.nodesMap.get(nodeId);
    let getFlowDefinition = (flowId: FlowId): Flow | undefined =>
      node.task.procedure.flowsMap.get(flowId);

    for (let next of node.definition.nexts) {
      if (existedNextTimesDict[next]) {
        existedNextTimesDict[next] -= 1;
        continue;
      }

      let usedNodeSet = new Set<NodeId>([node.definition.id]);

      nextNodeMetadata.nexts.push(
        initNode(next, {
          usedNodeSet,
          getNodeDefinition,
          getFlowDefinition,
        }),
      );
    }
  }

  return nextNodeMetadata;
}

function correctionTaskSingleNodeMetadata(
  node: TaskSingleNode,
): TaskSingleNodeMetadata {
  let {stage, nexts, ...rest} = node.metadata;
  // eslint-disable-next-line @mufan/explicit-return-type
  let {nextNode = (_, metadata) => metadata} = node.task.runtime;

  return nextNode(node, {
    stage: node.stage,
    nexts: node.nexts?.map(correctionTaskNodeMetadata),
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
    nexts: node.nexts?.map(correctionTaskNodeMetadata),
    ...cloneDeep(rest),
  };
}
