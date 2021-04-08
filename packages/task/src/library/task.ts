import {
  BranchesNode,
  Flow,
  FlowId,
  INode,
  Leaf,
  Node,
  NodeId,
  Procedure as ProcedureDefinition,
} from '@magicflow/core';
import {Procedure} from '@magicflow/procedure';
import {createId} from '@magicflow/procedure/utils';
import {enableAllPlugins} from 'immer';
import {Dict} from 'tslang';

import {
  ITaskNodeMetadata,
  TaskBranchesNodeMetadata,
  TaskFlowMetadata,
  TaskLeafMetadata,
  TaskMetadata,
  TaskNodeMetadata,
  TaskNodeStage,
} from './core';

enableAllPlugins();

export class Task {
  get startFlow(): TaskFlow {
    let {start} = this.metadata;

    return new TaskFlow(
      this,
      this.getFlowDefinition(start.definition)!,
      start,
      this.outputs,
    );
  }

  get outputs(): Dict<any> {
    let {outputs = {}} = this.metadata;

    // preload outputs

    return outputs;
  }

  constructor(
    private readonly procedure: Procedure,
    private metadata: TaskMetadata,
  ) {}

  getFlowDefinition(flow: FlowId): Flow | undefined {
    return this.procedure.flowsMap.get(flow);
  }

  getNodeDefinition(id: NodeId): Node | undefined {
    let node = this.procedure.nodesMap.get(id);
    return node?.type === 'node' ? node : undefined;
  }

  getBranchesDefinition(id: NodeId): BranchesNode | undefined {
    let node = this.procedure.nodesMap.get(id);
    return node?.type === 'branchesNode' ? node : undefined;
  }
}

export class TaskFlow {
  get nodes(): (TaskNode | TaskBranchesNode)[] {
    let {nodes} = this.metadata;

    let task = this.task;
    let inputs = this.outputs;

    return nodes.map(node => {
      return node.type === 'node'
        ? new TaskNode(
            task,
            task.getNodeDefinition(node.definition)!,
            node,
            inputs,
          )
        : new TaskBranchesNode(
            task,
            task.getBranchesDefinition(node.definition)!,
            node,
            inputs,
          );
    });
  }

  get outputs(): Dict<any> {
    let {outputs = {}} = this.metadata;

    return {
      ...this.inputs,
      ...outputs,
    };
  }

  constructor(
    private task: Task,
    private readonly definition: Flow,
    private metadata: TaskFlowMetadata,
    private inputs: Dict<any>,
  ) {}
}

abstract class TaskGeneralNode {
  abstract get stage(): TaskNodeStage;

  get nodes(): (TaskNode | TaskBranchesNode)[] {
    let {nexts = []} = this.metadata;

    let task = this.task;
    let inputs = this.outputs;

    return nexts.map(node => {
      return node.type === 'node'
        ? new TaskNode(
            task,
            task.getNodeDefinition(node.definition)!,
            node,
            inputs,
          )
        : new TaskBranchesNode(
            task,
            task.getBranchesDefinition(node.definition)!,
            node,
            inputs,
          );
    });
  }

  get outputs(): Dict<any> {
    let {outputs = {}} = this.metadata;

    return {
      ...this.inputs,
      // 完成了才会输出 outputs
      ...(this.stage === 'done' ? outputs : {}),
    };
  }

  constructor(
    public task: Task,
    readonly definition: INode,
    public metadata: ITaskNodeMetadata,
    public inputs: Dict<any>,
  ) {}
}

export class TaskBranchesNode extends TaskGeneralNode {
  get stage(): TaskNodeStage {
    return this.metadata.stage;
  }

  get flows(): TaskFlow[] {
    let {flows = []} = this.metadata;

    let task = this.task;
    let inputs = this.outputs;

    let taskFlows: TaskFlow[] = [];

    for (let flow of flows) {
      let taskFlow = new TaskFlow(
        task,
        task.getFlowDefinition(flow.definition)!,
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
  ) {
    super(task, definition, metadata, inputs);
  }
}

export class TaskNode extends TaskGeneralNode {
  get stage(): TaskNodeStage {
    return this.metadata.stage;
  }

  constructor(
    public task: Task,
    readonly definition: Node,
    public metadata: TaskNodeMetadata,
    public inputs: Dict<any>,
  ) {
    super(task, definition, metadata, inputs);
  }
}

function initTask({
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

  function initFlow({id, nodes: nodeIds}: Flow): TaskFlowMetadata {
    let nodes: (TaskNodeMetadata | TaskBranchesNodeMetadata)[] = [];

    for (let nodeId of nodeIds) {
      let edge = `${id}-${nodeId}`;

      if (edgeSet.has(edge)) {
        continue;
      }

      let node = nodesMap.get(nodeId)!;
      nodes.push(
        node.type === 'node' ? initNode(node) : initBranchesNode(node),
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

  function initNode({
    id,
    type,
    nexts: nextIds,
    leaves,
  }: Node): TaskNodeMetadata {
    let nexts: (TaskNodeMetadata | TaskBranchesNodeMetadata)[] = [];

    for (let nextId of nextIds) {
      let edge = `${id}-${nextId}`;

      if (edgeSet.has(edge)) {
        continue;
      }

      let node = nodesMap.get(nextId)!;
      nexts.push(
        node.type === 'node' ? initNode(node) : initBranchesNode(node),
      );
      edgeSet.add(edge);
    }

    return {
      id: createId(),
      definition: id,
      type,
      stage: 'none',
      nexts,
      leaves: leaves?.map(initLeaf),
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
        type: 'node',
      }),
      type: 'branchesNode',
      flows,
    };
  }

  function initLeaf({id}: Leaf): TaskLeafMetadata {
    return {
      id: createId(),
      definition: id,
    };
  }
}
