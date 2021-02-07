import {createContext} from 'react';

import {Procedure} from '../core';

import {EditorProps, LeafRenderDescriptors} from './editor.doc';

export const EditorContext = createContext<{
  props: EditorProps;
  procedure: Procedure;
  leavesMap: Map<string, LeafRenderDescriptors>;
}>(undefined!);
