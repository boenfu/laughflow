import {createContext, useContext} from 'react';

import {ProcedureEditor} from '../procedure-editor';
import {ProcedureViewer} from '../procedure-viewer';

export interface FlowEditorContext {
  context: 'editor';
  editor: ProcedureEditor;
}

export interface FlowViewerContext {
  context: 'viewer';
  viewer: ProcedureViewer;
}

export const FlowContext = createContext<FlowEditorContext | FlowViewerContext>(
  undefined!,
);

export const useEditorContext = (): ProcedureEditor =>
  (useContext(FlowContext) as FlowEditorContext)?.editor;

export const useViewerContext = (): ProcedureViewer =>
  (useContext(FlowContext) as FlowViewerContext)?.viewer;
