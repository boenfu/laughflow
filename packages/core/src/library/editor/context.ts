import {createContext} from 'react';

import {Procedure} from '../core';

export const EditorContext = createContext<{
  procedure: Procedure;
}>(undefined!);
