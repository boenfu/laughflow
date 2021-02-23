import {createContext} from 'react';

import {Editor} from './editor';

export const EditorContext = createContext<{
  editor: Editor;
}>(undefined!);
