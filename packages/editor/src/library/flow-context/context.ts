import {createContext, useContext} from 'react';

import {ProcedureViewer} from '../procedure-viewer';

export interface FlowViewerContext {
  context: 'viewer';
  viewer: ProcedureViewer;
}

export const FlowContext = createContext<FlowViewerContext>(undefined!);

export const useViewerContext = (): ProcedureViewer =>
  useContext(FlowContext)?.viewer;
