import {createContext} from 'react';

import {Editor} from './editor-object';

export const EditorContext = createContext<{
  editor: Editor;
}>(undefined!);
