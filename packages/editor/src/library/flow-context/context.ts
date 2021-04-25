import {Task} from '@magicflow/task';
import {createContext} from 'react';

import {ProcedureEditor} from '../procedure-editor';

export interface FlowViewerContext {
  type: 'viewer';
  editor: ProcedureEditor;
  task?: Task;
}

export interface FlowEditorContext {
  type: 'editor';
  editor: ProcedureEditor;
}

export const FlowContext = createContext<FlowEditorContext | FlowViewerContext>(
  undefined!,
);
