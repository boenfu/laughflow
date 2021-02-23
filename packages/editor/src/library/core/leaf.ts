import {Nominal} from 'tslang';

export type LeafPluginType = Nominal<string, ['leaf-plugin-type']>;

export type LeafType = 'done' | 'terminate' | LeafPluginType;

export type LeafId = Nominal<string, 'leaf:id'>;

export interface LeafMetadata {
  id: LeafId;
  type: LeafType;
}
