import {Nominal} from 'tslang';

import {NodeId} from './node';

export type FlowId = Nominal<string, 'flow:id'>;

export interface Flow extends Magicflow.FlowExtension {
  id: FlowId;
  nodes: NodeId[];
}
