import {Nominal} from 'tslang';

import {LeafMetadata} from './leaf';
import {NodeMetadata} from './node';

export type ProcedureId = Nominal<string, 'procedure:id'>;

export interface ProcedureMetadata {}

export interface ProcedureDefinition {
  id: ProcedureId;
  leaves: LeafMetadata[];
  nodes: NodeMetadata[];
  metadata?: ProcedureMetadata;
}
