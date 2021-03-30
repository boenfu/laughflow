import {Nominal} from 'tslang';

export type LeafId = Nominal<string, 'leaf:id'>;

export type LeafType = 'done' | 'terminate';

export interface Leaf extends Magicflow.LeafExtension {
  id: LeafId;
  type: LeafType;
}
