import {JointId} from './joint';
import {LeafId} from './leaf';
import {NodeId} from './node';

export type Ref = NodeRef | LeafRef | JointRef;

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
