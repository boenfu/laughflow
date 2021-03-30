import {Nominal} from 'tslang';

import {FlowId} from './flow';
import {Leaf} from './leaf';

export type NodeId = Nominal<string, 'node:id'>;

export type NodeType = 'node' | 'branchesNode';

export interface INode {
  type: NodeType;
  id: NodeId;
  leaves: Leaf[] | undefined;
  nexts: NodeId[] | undefined;
}

export interface Node extends Magicflow.NodeExtension, INode {
  type: 'node';
}

export interface BranchesNode extends Magicflow.BranchesNodeExtension, INode {
  type: 'branchesNode';
  flows: FlowId[];
}
