import {Nominal} from 'tslang';

import {NodeId} from './node';

export type FlowId = Nominal<string, 'flow:id'>;

export interface Flow extends laughflow.FlowExtension {
  id: FlowId;
  starts: NodeId[];
}
