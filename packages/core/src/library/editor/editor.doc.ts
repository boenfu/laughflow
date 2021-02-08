import {ProcedureDefinition} from '../core';
import {IPlugin} from '../plugin';

export interface EditorProps {
  definition: ProcedureDefinition;
  plugins?: IPlugin[];
}
