import {Nominal} from 'tslang';

import {NodeId, NodeNextMetadata} from './node';

export type JointId = Nominal<string, 'joint:id'>;

export interface JointMetadata {
  id: JointId;
  master: NodeId;
  nexts?: NodeNextMetadata[];
}
