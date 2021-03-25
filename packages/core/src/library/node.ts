import {Nominal} from 'tslang';

import {LeafMetadata} from './leaf';
import {TrunkRef} from './ref';

export type NodeId = Nominal<string, 'node:id'>;

export interface NodeMetadata extends Magicflow.NodeMetadataExtension {
  id: NodeId;
  leaves?: LeafMetadata[];
  nexts?: TrunkRef[];
}
