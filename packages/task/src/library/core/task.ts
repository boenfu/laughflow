import {
  IOutputsEntity,
  Procedure,
  ProcedureDefinition,
  ProcedureId,
} from '@magicflow/procedure';
import {createId} from '@magicflow/procedure/utils';
import {cloneDeep, compact} from 'lodash-es';
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

  let nextFlowMetadata = {
    stage: flow.stage,
    starts: flow.starts.map(correctionTaskNodeMetadata),
    ...cloneDeep(rest),
  };

  // 由于任务初始化，每个 edge (node|flow -> node) 只实例了一次
  // 所以在 node 不为 none 的时候，就去检查一次是否有需要实例化的 node
  if (
    flow.stage !== 'none' &&
    flow.definition.starts.length &&
    flow.definition.starts.length !== nextFlowMetadata.starts?.length
  ) {
    let existedStartIdsSet = new Set(
      nextFlowMetadata.starts?.map(starts => starts.definition),
    );

    nextFlowMetadata.starts = nextFlowMetadata.starts || [];

    nextFlowMetadata.starts.push(
      ...compact(
        flow.definition.starts.map(start => {
          if (existedStartIdsSet.has(start)) {
            existedStartIdsSet.delete(start);
            return undefined;
          }

          let nodeDefinition = flow.task.procedure.nodesMap.get(start);

          return {
            id: createId(),
            definition: start,
            type: nodeDefinition?.type,
            stage: 'none',
            nexts: [],
          } as TaskNodeMetadata;
        }),
      ),
    );
  }

  return nextFlowMetadata;
}

function correctionTaskNodeMetadata(node: TaskNode): TaskNodeMetadata {
  let nextNodeMetadata =
    node instanceof TaskSingleNode
      ? correctionTaskSingleNodeMetadata(node)
      : correctionTaskBranchesNodeMetadata(node);

  // 由于任务初始化，每个 edge (node|flow -> node) 只实例了一次
  // 所以在 node 不为 none 的时候，就去检查一次是否有需要实例化的 node
  if (
    node.stage !== 'none' &&
    node.definition.nexts.length &&
    node.definition.nexts.length !== nextNodeMetadata.nexts?.length
  ) {
    let existedNextIdsSet = new Set(
      nextNodeMetadata.nexts?.map(next => next.definition),
    );

    nextNodeMetadata.nexts = nextNodeMetadata.nexts || [];

    console.log(node, '我需要补签');

    nextNodeMetadata.nexts.push(
      ...compact(
        node.definition.nexts.map(next => {
          if (existedNextIdsSet.has(next)) {
            existedNextIdsSet.delete(next);
            return undefined;
          }

          let nodeDefinition = node.task.procedure.nodesMap.get(next);

          return {
            id: createId(),
            definition: next,
            type: nodeDefinition?.type,
            stage: 'none',
            nexts: [],
          } as TaskNodeMetadata;
        }),
      ),
    );

    console.log(nextNodeMetadata);
  }

  return nextNodeMetadata;
}

function correctionTaskSingleNodeMetadata(
  node: TaskSingleNode,
): TaskSingleNodeMetadata {
  let {stage, nexts, ...rest} = node.metadata;
  // eslint-disable-next-line @mufan/explicit-return-type
  let {nextNode = metadata => metadata} = node.task.runtime;

  return nextNode({
    stage: node.stage,
    nexts: node.nexts?.map(correctionTaskNodeMetadata),
    ...cloneDeep(rest),
  });
}

function correctionTaskBranchesNodeMetadata(
  node: TaskBranchesNode,
): TaskBranchesNodeMetadata {
  let {stage, flows, nexts, ...rest} = node.metadata;

  let nextNodeMetadata = {
    stage: node.stage,
    flows: node.flows.map(correctionTaskFlowMetadata),
    nexts: node.nexts?.map(correctionTaskNodeMetadata),
    ...cloneDeep(rest),
  };

  // 由于任务初始化，每个 edge (node|flow -> node|flow) 只实例了一次
  // 所以在 node 不为 none 的时候，就去检查一次是否有需要实例化的 flows
  if (
    node.stage !== 'none' &&
    node.definition.flows.length &&
    node.definition.flows.length !== nextNodeMetadata.flows?.length
  ) {
    let existedFlowIdsSet = new Set(
      nextNodeMetadata.flows?.map(flow => flow.definition),
    );

    nextNodeMetadata.flows = nextNodeMetadata.flows || [];

    nextNodeMetadata.flows.push(
      ...compact(
        node.definition.flows.map(next => {
          if (existedFlowIdsSet.has(next)) {
            existedFlowIdsSet.delete(next);
            return undefined;
          }

          return {
            id: createId(),
            definition: next,
            stage: 'none',
            starts: [],
          } as TaskFlowMetadata;
        }),
      ),
    );
  }

  return nextNodeMetadata;
}
