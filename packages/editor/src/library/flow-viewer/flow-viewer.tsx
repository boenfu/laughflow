import {IPlugin} from '@magicflow/plugins';
import {
  ProcedureDefinition,
  ProcedureSingleTreeNode,
} from '@magicflow/procedure';
import {Task, TaskSingleNode} from '@magicflow/task';
import {useCreation, useUpdate} from 'ahooks';
import React, {
  createContext,
  forwardRef,
  useEffect,
  useImperativeHandle,
} from 'react';

import {FlowSkeleton} from '../flow-skeleton';
import {ProcedureEditor} from '../procedure-editor';

import {SingleNode} from './@node';

export interface FlowViewerProps {
  value: ProcedureDefinition | Task;
  plugins?: IPlugin[];
  isNodeActive?(node: ProcedureSingleTreeNode | TaskSingleNode): boolean;
}

export const FlowViewerContext = createContext<{
  editor: ProcedureEditor;
}>(undefined!);

export const FlowViewer = forwardRef<ProcedureEditor, FlowViewerProps>(
  ({value, plugins, isNodeActive}, ref) => {
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
        return;
      }

      editor.definition = value;
    }, [editor, value]);

    useImperativeHandle(ref, () => editor);

    return (
      <FlowViewerContext.Provider value={{editor}}>
        <FlowSkeleton
          flow={value instanceof Task ? value.startFlow : editor.rootFlow}
          readonly
          nodeRender={SingleNode}
          nodeNextsRender={node => ('left' in node ? !node.left : true)}
          isNodeActive={isNodeActive}
        />
      </FlowViewerContext.Provider>
    );
  },
);
