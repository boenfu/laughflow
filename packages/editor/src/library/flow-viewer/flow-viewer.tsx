import {IPlugin} from '@magicflow/plugins';
import {ProcedureDefinition} from '@magicflow/procedure';
import {Task} from '@magicflow/task';
import {useCreation, useUpdate} from 'ahooks';
import React, {
  FC,
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
}

export const FlowViewerContext = createContext<{
  editor: ProcedureEditor;
}>(undefined!);

export const FlowViewer: FC<FlowViewerProps> = forwardRef<
  ProcedureEditor,
  FlowViewerProps
>(({value, plugins}, ref) => {
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

  useImperativeHandle(ref, () => editor);

  return (
    <FlowViewerContext.Provider value={{editor}}>
      <FlowSkeleton
        flow={value instanceof Task ? value.startFlow : editor.rootFlow}
        readonly
        nodeRender={SingleNode}
        nodeNextsRender={node => ('left' in node ? !node.left : true)}
      />
    </FlowViewerContext.Provider>
  );
});
