import {Nominal} from 'tslang';

export type LeafType = 'done' | 'terminate';

export type LeafId = Nominal<string, 'leaf:id'>;

export interface LeafMetadata extends Magicflow.LeafMetadataExtension {
  id: LeafId;
  type: LeafType;
}
