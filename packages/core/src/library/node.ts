import {Nominal} from 'tslang';

import {LeafId} from './leaf';

export type NodeId = Nominal<string, 'node:id'>;

export type NextMetadata = NextNodeMetadata | NextLeafMetadata;

export interface NextLeafMetadata {
  type: 'leaf';
  id: LeafId;
}

export interface NextNodeMetadata {
  type: 'node';
  id: NodeId;
}

export interface NodeMetadata {
  id: NodeId;
  nexts?: NextMetadata[];
}
