import {ProcedureDefinition} from '@magicflow/core';

import {IPlugin} from '../plugin';

export interface EditorProps {
  definition: ProcedureDefinition;
  plugins?: IPlugin[];
}
