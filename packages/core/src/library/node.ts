import {Nominal} from 'tslang';

import {JointId} from './joint';
import {LeafId} from './leaf';

export type NodeId = Nominal<string, 'node:id'>;

export type NodeNextMetadata =
  | NodeNextNodeMetadata
  | NodeNextLeafMetadata
  | NodeNextJointMetadata;

export interface NodeNextLeafMetadata {
  type: 'leaf';
  id: LeafId;
}

export interface NodeNextNodeMetadata {
  type: 'node';
  id: NodeId;
}

export interface NodeNextJointMetadata {
  type: 'joint';
  id: JointId;
}

export interface NodeMetadata {
  id: NodeId;
  nexts?: NodeNextMetadata[];
}
