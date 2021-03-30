import {LeafId} from './leaf';
import {NodeId, NodeType} from './node';

export type Ref = NodeRef | LeafRef;

export interface LeafRef {
  type: 'leaf';
  id: LeafId;
}

export interface NodeRef {
  type: NodeType;
  id: NodeId;
}
