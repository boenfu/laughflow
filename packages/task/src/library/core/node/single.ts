import {SingleNode} from '@laughflow/procedure';
import {Dict} from 'tslang';

import {getBranchesDefinition, getNodeDefinition} from '../../utils';
import {Task, TaskStage} from '../task';

import {TaskBranchesNode} from './branches';
import {ITaskNodeMetadata, TaskNode, TaskNodeId} from './node';

export interface TaskSingleNodeMetadata
  extends ITaskNodeMetadata,
    laughflow.TaskSingleNodeMetadataExtension {
  type: 'singleNode';
}

export class TaskSingleNode {
  get id(): TaskNodeId {
    return this.metadata.id;
  }

  get stage(): TaskStage {
    let stage = this.metadata.stage;

    if (this.blocked) {
      return 'none';
    }

    if (this.broken) {
      return 'none';
    }

    if (this.ignored) {
      return 'done';
    }

    if (stage !== 'none' && !this.ableToBeStart) {
      return 'none';
    }

    if (stage === 'in-progress') {
      if (this.ableToBeTerminated) {
        return 'terminated';
      }

      if (this.ableToBeDone) {
        return 'done';
      }
    }

    if (
      (stage === 'terminated' && !this.ableToBeTerminated) ||
      (stage === 'done' && !this.ableToBeDone)
    ) {
      return 'none';
    }

    return stage;
  }

  get broken(): boolean {
    return !this.blocked && !!this.task.runtime.nodeBroken?.(this);
  }

  get ignored(): boolean {
    return !this.blocked && !!this.task.runtime.nodeIgnored?.(this);
  }

  get ableToBeStart(): boolean {
    if (this.blocked) {
      return false;
    }

    let {nodeStartAble} = this.task.runtime;

    if (!nodeStartAble) {
      return true;
    }

    return nodeStartAble(this);
  }

  get ableToBeDone(): boolean {
    if (this.blocked) {
      return false;
    }

    let {nodeDone} = this.task.runtime;

    if (!nodeDone) {
      return true;
    }

    return nodeDone(this);
  }

  get ableToBeTerminated(): boolean {
    return !!this.task.runtime.nodeTerminated?.(this);
  }

  get nexts(): TaskNode[] {
    let {nexts = []} = this.metadata;

    if (this.broken) {
      return [];
    }

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

  // 此节点所能抵达的第一个未完成节点/自身是最后一个节点
  get leafNodes(): TaskNode[] {
    if (this.stage !== 'done' || !this.nexts.length) {
      return [this];
    }

    return this.nexts.flatMap(node => node.leafNodes);
  }

  get outputs(): Dict<any> {
    if (this.ignored || this.stage !== 'done') {
      return this.inputs;
    }

    let {outputs = {}} = this.metadata;

    return {
      ...this.inputs,
      ...outputs,
      ...this.task.runtime.nodeOutputs?.(this),
    };
  }

  constructor(
    readonly task: Task,
    readonly definition: SingleNode,
    readonly metadata: TaskSingleNodeMetadata,
    readonly blocked: boolean,
    readonly inputs: Dict<any>,
  ) {}

  next(operator: (metadata: TaskSingleNodeMetadata) => void): Task {
    operator(this.metadata);
    return this.task.next();
  }
}
