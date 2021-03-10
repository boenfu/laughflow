import {Nominal} from 'tslang';

import {JointMetadata} from './joint';
import {LeafMetadata} from './leaf';
import {NodeMetadata} from './node';

export type ProcedureId = Nominal<string, 'procedure:id'>;

export interface ProcedureMetadata {}

export interface ProcedureDefinition<
  TProcedureMetadata extends ProcedureMetadata = ProcedureMetadata,
  TNodeMetadata extends NodeMetadata = NodeMetadata,
  TLeafMetadata extends LeafMetadata = LeafMetadata,
  TJointMetadata extends JointMetadata = JointMetadata
> {
  id: ProcedureId;
  nodes: TNodeMetadata[];
  joints: TJointMetadata[];
  leaves: TLeafMetadata[];
  metadata?: TProcedureMetadata;
}
