import {Nominal} from 'tslang';

import {Ref, TrunkRef} from './ref';

export type JointId = Nominal<string, 'joint:id'>;

export interface JointMetadata {
  id: JointId;
  master: TrunkRef;
  nexts?: Ref[];
}
