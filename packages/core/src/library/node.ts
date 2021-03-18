import {Nominal} from 'tslang';

import {Ref} from './ref';

export type NodeId = Nominal<string, 'node:id'>;

export interface NodeMetadata extends Magicflow.NodeMetadataExtension {
  id: NodeId;
  nexts?: Ref[];
}
