import type {IPlugin} from '@laughflow/plugins';
import type {
  ProcedureDefinition,
  ProcedureSingleTreeNode,
} from '@laughflow/procedure';
import type {TaskSingleNode} from '@laughflow/task';
import {Task} from '@laughflow/task';
import {useCreation, useUpdate} from 'ahooks';
import React, {
  createContext,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import {FlowSkeleton} from '../flow-skeleton';
import {ProcedureEditor} from '../procedure-editor';

import {SingleNode} from './@node';

export interface FlowViewerProps {
  value: ProcedureDefinition | Task;
  plugins?: IPlugin[];
  isNodeActive?(node: ProcedureSingleTreeNode | TaskSingleNode): boolean;
}

export type FlowViewerMode = 'task' | 'procedure';

export const FlowViewerContext = createContext<{
  editor: ProcedureEditor;
  mode: FlowViewerMode;
}>(undefined!);

export const FlowViewer = forwardRef<ProcedureEditor, FlowViewerProps>(
  ({value, plugins, isNodeActive}, ref) => {
    const [mode, setMode] = useState<FlowViewerMode>(
      value instanceof Task ? 'task' : 'procedure',
    );
    const reRender = useUpdate();

    const editor = useCreation(
      () =>
        new ProcedureEditor(
          value instanceof Task ? value.definition : value,
          plugins,
        ),
      [],
    );

    useEffect(() => {
      editor.on('update', () => {
        reRender();
      });

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (value instanceof Task) {
        setMode('task');
        return;
      }

      setMode('procedure');

      editor.definition = value;
    }, [editor, value]);

    useImperativeHandle(ref, () => editor);

    return (
      <FlowViewerContext.Provider value={{editor, mode}}>
        <FlowSkeleton
          flow={mode === 'task' ? (value as Task).startFlow : editor.rootFlow}
          readonly
          nodeRender={SingleNode}
          nodeNextsRender={node => ('left' in node ? !node.left : true)}
          isNodeActive={isNodeActive}
        />
      </FlowViewerContext.Provider>
    );
  },
);
