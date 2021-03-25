import {Nominal} from 'tslang';

import {JointMetadata} from './joint';
import {NodeMetadata} from './node';

export type ProcedureId = Nominal<string, 'procedure:id'>;

export interface ProcedureMetadata
  extends Magicflow.ProcedureMetadataExtension {}

export interface ProcedureDefinition {
  id: ProcedureId;
  nodes: NodeMetadata[];
  joints: JointMetadata[];
  metadata?: ProcedureMetadata;
}
