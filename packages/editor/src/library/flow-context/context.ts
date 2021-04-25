import {Task} from '@magicflow/task';
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
  task?: Task;
}

export const FlowContext = createContext<FlowEditorContext | FlowViewerContext>(
  undefined!,
);

export const useEditorContext = (): FlowEditorContext =>
  useContext(FlowContext) as FlowEditorContext;

export const useViewerContext = (): FlowViewerContext =>
  useContext(FlowContext) as FlowViewerContext;
