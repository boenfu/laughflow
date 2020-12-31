import {createContext} from 'react';

import {Procedure} from '../core';
import {ILeafPlugin} from '../plugin';

import {EditorProps} from './editor.doc';

export const EditorContext = createContext<{
  props: EditorProps;
  procedure: Procedure;
  leavesMap: Map<string, ILeafPlugin<string>>;
}>(undefined!);
