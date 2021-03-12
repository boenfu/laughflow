import {Nominal} from 'tslang';

import {Ref} from './ref';

export type JointId = Nominal<string, 'joint:id'>;

export interface JointMetadata {
  id: JointId;
  nexts?: Ref[];
}
