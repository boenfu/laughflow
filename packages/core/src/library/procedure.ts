import {Nominal} from 'tslang';

import {LeafMetadata} from './leaf';
import {NodeMetadata} from './node';

export type ProcedureId = Nominal<string, 'procedure:id'>;

export interface ProcedureMetadata {}

export interface ProcedureDefinition<
  TProcedureMetadata extends ProcedureMetadata = ProcedureMetadata,
  TNodeMetadata extends NodeMetadata = NodeMetadata,
  TLeafMetadata extends LeafMetadata = LeafMetadata
> {
  id: ProcedureId;
  leaves: TLeafMetadata[];
  nodes: TNodeMetadata[];
  metadata?: TProcedureMetadata;
}
