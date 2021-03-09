import {Nominal} from 'tslang';

import {LeafId} from './leaf';

export type NodeId = Nominal<string, 'node:id'>;

export type NodeNextMetadata = NodeNextNodeMetadata | NodeNextLeafMetadata;

export interface NodeNextLeafMetadata {
  type: 'leaf';
  id: LeafId;
}

export interface NodeNextNodeMetadata {
  type: 'node';
  id: NodeId;
}

export interface NodeMetadata {
  id: NodeId;
  nexts?: NodeNextMetadata[];
}
