import {Nominal} from 'tslang';

export type LeafType = 'done' | 'terminate' | 'wormhole';

export type LeafId = Nominal<string, 'leaf:id'>;

export interface LeafMetadata {
  id: LeafId;
  type: LeafType;
}
