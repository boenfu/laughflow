import {createContext} from 'react';

import {ProcedureEditor} from './procedure-editor';

export const EditorContext = createContext<{
  editor: ProcedureEditor;
}>(undefined!);
