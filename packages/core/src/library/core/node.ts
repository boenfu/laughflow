import {Nominal} from 'tslang';

export type NodeId = Nominal<string, 'node:id'>;

export interface NodeMetadata {
  id: NodeId;
  displayName?: string;
}
