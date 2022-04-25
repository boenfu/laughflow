import type {Nominal} from 'tslang';

import type {Flow, FlowId} from './flow';
import type {Node} from './node';

export type ProcedureId = Nominal<string, 'procedure:id'>;

export interface ProcedureDefinition extends laughflow.ProcedureExtension {
  id: ProcedureId;
  start: FlowId;
  nodes: Node[];
  flows: Flow[];
}
