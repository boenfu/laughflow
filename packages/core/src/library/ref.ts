import {JointId} from './joint';
import {LeafId} from './leaf';
import {NodeId} from './node';

export type Ref = TrunkRef | LeafRef;

export type TrunkRef = NodeRef | JointRef;

export interface LeafRef {
  type: 'leaf';
  id: LeafId;
}

export interface NodeRef {
  type: 'node';
  id: NodeId;
}

export interface JointRef {
  type: 'joint';
  id: JointId;
}
