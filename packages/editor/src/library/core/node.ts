import {Nominal} from 'tslang';

import {LeafId} from './leaf';

export type NodeId = 'start' | Nominal<string, 'node:id'>;

export type NextMetadata = NodeNextMetadata | LeafNextMetadata;

export interface LeafNextMetadata {
  type: 'leaf';
  id: LeafId;
}

export interface NodeNextMetadata {
  type: 'node';
  id: NodeId;
}

export interface NodeMetadata {
  id: NodeId;
  displayName?: string;
  nexts?: NextMetadata[];
}
