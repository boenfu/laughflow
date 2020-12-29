import {createContext} from 'react';

import {Procedure} from '../core';

import {EditorProps} from './editor.doc';

export const EditorContext = createContext<{
  props: EditorProps;
  procedure: Procedure;
}>(undefined!);
