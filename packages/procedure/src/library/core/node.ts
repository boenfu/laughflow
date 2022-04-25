import type {Nominal} from 'tslang';

import type {FlowId} from './flow';

export type NodeId = Nominal<string, 'node:id'>;

export type NodeType = 'singleNode' | 'branchesNode';

export interface INode {
  id: NodeId;
  type: NodeType;
  nexts: NodeId[];
}

export type Node = SingleNode | BranchesNode;

export interface SingleNode extends laughflow.SingleNodeExtension, INode {
  type: 'singleNode';
}

export interface BranchesNode extends laughflow.BranchesNodeExtension, INode {
  type: 'branchesNode';
  flows: FlowId[];
}
