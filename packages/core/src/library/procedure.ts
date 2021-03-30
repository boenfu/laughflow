import {Nominal} from 'tslang';

import {Flow, FlowId} from './flow';
import {BranchesNode, Node} from './node';

export type ProcedureId = Nominal<string, 'procedure:id'>;

export interface Procedure extends Magicflow.ProcedureExtension {
  id: ProcedureId;
  start: FlowId;
  nodes: (Node | BranchesNode)[];
  flows: Flow[];
}
