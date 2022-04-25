import type {Nominal} from 'tslang';

import type {NodeId} from './node';

export type FlowId = Nominal<string, 'flow:id'>;

export interface Flow extends laughflow.FlowExtension {
  id: FlowId;
  starts: NodeId[];
}
