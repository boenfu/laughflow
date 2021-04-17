import {Nominal} from 'tslang';

import {FlowId} from './flow';

export type NodeId = Nominal<string, 'node:id'>;

export type NodeType = 'singleNode' | 'branchesNode';

export interface INode {
  id: NodeId;
  type: NodeType;
  nexts: NodeId[];
}

export type Node = SingleNode | BranchesNode;

export interface SingleNode extends Magicflow.SingleNodeExtension, INode {
  type: 'singleNode';
}

export interface BranchesNode extends Magicflow.BranchesNodeExtension, INode {
  type: 'branchesNode';
  flows: FlowId[];
}
