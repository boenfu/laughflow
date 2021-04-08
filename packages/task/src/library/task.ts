import {
  BranchesNode,
  Flow,
  FlowId,
  NodeId,
  Procedure as ProcedureDefinition,
  SingleNode,
} from '@magicflow/core';
import {Procedure} from '@magicflow/procedure';
import {createId} from '@magicflow/procedure/utils';
import {enableAllPlugins} from 'immer';
import {cloneDeep} from 'lodash-es';
import {Dict} from 'tslang';

import {
  TaskBranchesNodeMetadata,
  TaskFlowMetadata,
  TaskMetadata,
  TaskNodeMetadata,
  TaskStage,
} from './core';

enableAllPlugins();

export class Task {
  get stage(): TaskStage {
    // plugin:

    return this.startFlow.stage;
  }

  get startFlow(): TaskFlow {
    let {start} = this.metadata;

    return new TaskFlow(
      this,
      getFlowDefinition(this, start.definition)!,
      start,
      this.outputs,
    );
  }

  get outputs(): Dict<any> {
    let {outputs = {}} = this.metadata;

    // plugin:preload outputs
    // such as tag

    return outputs;
  }

  constructor(readonly procedure: Procedure, private metadata: TaskMetadata) {}
}

export class TaskNode {
  get stage(): TaskStage {
    if (this.broken) {
      return 'none';
    }

    if (this.ignored) {
      return 'done';
    }

    return this.metadata.stage;
  }

  get broken(): boolean {
    // plugin:
    return false;
  }

  get ignored(): boolean {
    // plugin:
    return false;
  }

  get ableToBeDone(): boolean {
    if (this.stage !== 'in-progress') {
      return false;
    }

    // plugin:

    return true;
  }

  get nextNodes(): (TaskNode | TaskBranchesNode)[] {
    let {nexts = []} = this.metadata;

    let task = this.task;
    let inputs = this.outputs;

    return nexts.map(node => {
      return node.type === 'singleNode'
        ? new TaskNode(
            task,
            getNodeDefinition(task, node.definition)!,
            node,
            inputs,
          )
        : new TaskBranchesNode(
            task,
            getBranchesDefinition(task, node.definition)!,
            node,
            inputs,
          );
    });
  }

  // 此节点所能抵达的第一个未完成节点
  get leafNodes(): (TaskNode | TaskBranchesNode)[] {
    if (this.stage !== 'done') {
      return [this];
    }

    return this.nextNodes.flatMap(node => node.leafNodes);
  }

  get outputs(): Dict<any> {
    if (this.ignored || this.stage !== 'done') {
      return this.inputs;
    }

    let {outputs = {}} = this.metadata;

    return {
      ...this.inputs,
      ...outputs,
    };
  }

  constructor(
    public task: Task,
    readonly definition: SingleNode,
    public metadata: TaskNodeMetadata,
    public inputs: Dict<any>,
  ) {}
}

export class TaskBranchesNode {
  get stage(): TaskStage {
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
    // plugin:
    return false;
  }

  get ignored(): boolean {
    // plugin:
    return false;
  }

  get nextNodes(): (TaskNode | TaskBranchesNode)[] {
    let {nexts = []} = this.metadata;

    let task = this.task;
    let inputs = this.outputs;

    return nexts.map(node => {
      return node.type === 'singleNode'
        ? new TaskNode(
            task,
            getNodeDefinition(task, node.definition)!,
            node,
            inputs,
          )
        : new TaskBranchesNode(
            task,
            getBranchesDefinition(task, node.definition)!,
            node,
            inputs,
          );
    });
  }

  // 此节点所能抵达的第一个未完成节点
  get leafNodes(): (TaskNode | TaskBranchesNode)[] {
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
    let inputs = this.inputs;

    let taskFlows: TaskFlow[] = [];

    for (let flow of flows) {
      let taskFlow = new TaskFlow(
        task,
        getFlowDefinition(task, flow.definition)!,
        flow,
        inputs,
      );

      inputs = taskFlow.outputs;
    }

    return taskFlows;
  }

  constructor(
    public task: Task,
    readonly definition: BranchesNode,
    public metadata: TaskBranchesNodeMetadata,
    public inputs: Dict<any>,
  ) {}
}

export class TaskFlow {
  get stage(): TaskStage {
    let broken = true;
    let stageSet = new Set<TaskStage>();

    for (let node of this.nodes) {
      broken = !broken || node.broken;

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

    return 'none';
  }

  get nodes(): (TaskNode | TaskBranchesNode)[] {
    let {nodes} = this.metadata;

    let task = this.task;
    // 同一个 Flow 的多个开始 inputs 应该一致
    let inputs = this.inputs;

    return nodes.map(node => {
      return node.type === 'singleNode'
        ? new TaskNode(
            task,
            getNodeDefinition(task, node.definition)!,
            node,
            inputs,
          )
        : new TaskBranchesNode(
            task,
            getBranchesDefinition(task, node.definition)!,
            node,
            inputs,
          );
    });
  }

  get leafNodes(): (TaskNode | TaskBranchesNode)[] {
    return this.nodes.flatMap(node => node.leafNodes);
  }

  get outputs(): Dict<any> {
    let {outputs = {}} = this.metadata;

    return Object.assign(
      {},
      ...this.leafNodes.map(node => node.outputs),
      this.stage === 'done' ? outputs : {},
    );
  }

  constructor(
    private task: Task,
    private readonly definition: Flow,
    private metadata: TaskFlowMetadata,
    private inputs: Dict<any>,
  ) {}
}

/**
 * 初始化任务
 * @param param0
 * @returns
 */
export function initTask({
  id,
  start,
  flows,
  nodes,
}: ProcedureDefinition): TaskMetadata {
  let nodesMap = new Map(nodes.map(node => [node.id, node]));
  let flowsMap = new Map(flows.map(flow => [flow.id, flow]));

  let edgeSet = new Set();

  return {
    id: createId(),
    definition: id,
    stage: 'none',
    start: initFlow(flowsMap.get(start)!),
  };

  function initFlow({id, starts: nodeIds}: Flow): TaskFlowMetadata {
    let nodes: (TaskNodeMetadata | TaskBranchesNodeMetadata)[] = [];

    for (let nodeId of nodeIds) {
      let edge = `${id}-${nodeId}`;

      if (edgeSet.has(edge)) {
        continue;
      }

      let node = nodesMap.get(nodeId)!;
      nodes.push(
        node.type === 'singleNode' ? initNode(node) : initBranchesNode(node),
      );
      edgeSet.add(edge);
    }

    return {
      id: createId(),
      definition: id,
      stage: 'none',
      nodes,
    };
  }

  function initNode({id, type, nexts: nextIds}: SingleNode): TaskNodeMetadata {
    let nexts: (TaskNodeMetadata | TaskBranchesNodeMetadata)[] = [];

    for (let nextId of nextIds) {
      let edge = `${id}-${nextId}`;

      if (edgeSet.has(edge)) {
        continue;
      }

      let node = nodesMap.get(nextId)!;
      nexts.push(
        node.type === 'singleNode' ? initNode(node) : initBranchesNode(node),
      );
      edgeSet.add(edge);
    }

    return {
      id: createId(),
      definition: id,
      type,
      stage: 'none',
      nexts,
    };
  }

  function initBranchesNode(node: BranchesNode): TaskBranchesNodeMetadata {
    let flows: TaskFlowMetadata[] = [];

    for (let flowId of node.flows) {
      let edge = `${id}-${flowId}`;

      if (edgeSet.has(edge)) {
        continue;
      }

      let flow = flowsMap.get(flowId)!;
      flows.push(initFlow(flow));
      edgeSet.add(edge);
    }

    return {
      ...initNode({
        ...node,
        type: 'singleNode',
      }),
      type: 'branchesNode',
      flows,
    };
  }
}

/**
 * 升级任务流程
 * @param param0
 * @param task
 * @returns
 */
export function upgradeTask(
  {id, start, flows, nodes}: ProcedureDefinition,
  _task: TaskMetadata,
): TaskMetadata {
  let task = cloneDeep(_task);

  let nodesMap = new Map(nodes.map(node => [node.id, node]));
  let flowsMap = new Map(flows.map(flow => [flow.id, flow]));

  let edgeSet = new Set();

  checkFlow(flowsMap.get(start)!, task.start);

  return task;

  function checkFlow(
    {id, starts: nodeIds}: Flow,
    flow: TaskFlowMetadata,
  ): void {
    let definitionIdToNodesMap = new Map(
      flow.nodes.map(node => [node.definition, node]),
    );

    for (let nodeId of nodeIds) {
      let edge = `${id}-${nodeId}`;

      if (definitionIdToNodesMap.has(nodeId)) {
        edgeSet.add(edge);
        continue;
      }

      if (edgeSet.has(edge)) {
        continue;
      }

      let node = nodesMap.get(nodeId)!;

      if (node.type === 'singleNode') {
        checkNode(node, definitionIdToNodesMap.get(nodeId) as TaskNodeMetadata);
      } else {
        checkBranchesNode(
          node,
          definitionIdToNodesMap.get(nodeId) as TaskBranchesNodeMetadata,
        );
      }

      edgeSet.add(edge);
    }
  }

  function checkNode(
    {id, type, nexts: nextIds}: SingleNode,
    node: TaskNodeMetadata,
  ): void {
    let definitionIdToNodesMap = new Map(
      node.nexts?.map(node => [node.definition, node]),
    );

    for (let nextId of nextIds) {
      let edge = `${id}-${nextId}`;

      if (definitionIdToNodesMap.has(nextId)) {
        edgeSet.add(edge);
        continue;
      }

      if (edgeSet.has(edge)) {
        continue;
      }

      let node = nodesMap.get(nextId)!;

      if (node.type === 'singleNode') {
        checkNode(node, definitionIdToNodesMap.get(nextId) as TaskNodeMetadata);
      } else {
        checkBranchesNode(
          node,
          definitionIdToNodesMap.get(nextId) as TaskBranchesNodeMetadata,
        );
      }

      edgeSet.add(edge);
    }
  }

  function checkBranchesNode(
    node: BranchesNode,
    branchedNode: TaskBranchesNodeMetadata,
  ): void {
    for (let flowId of node.flows) {
      let edge = `${id}-${flowId}`;

      if (edgeSet.has(edge)) {
        continue;
      }

      let flow = flowsMap.get(flowId)!;
      // checkFlow(flow);
      edgeSet.add(edge);
    }

    // checkNode({
    //   ...node,
    //   type: 'node',
    // });
  }
}

function getFlowDefinition(task: Task, flow: FlowId): Flow | undefined {
  return task.procedure.flowsMap.get(flow);
}

function getNodeDefinition(task: Task, id: NodeId): SingleNode | undefined {
  let node = task.procedure.nodesMap.get(id);
  return node?.type === 'singleNode' ? node : undefined;
}

function getBranchesDefinition(
  task: Task,
  id: NodeId,
): BranchesNode | undefined {
  let node = task.procedure.nodesMap.get(id);
  return node?.type === 'branchesNode' ? node : undefined;
}
