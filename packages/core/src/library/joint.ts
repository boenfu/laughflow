import {Nominal} from 'tslang';

import {LeafMetadata} from './leaf';
import {TrunkRef} from './ref';

export type JointId = Nominal<string, 'joint:id'>;

export interface JointMetadata extends Magicflow.JointMetadataExtension {
  id: JointId;
  master: TrunkRef;
  leaves?: LeafMetadata[];
  nexts?: TrunkRef[];
}
