import {IPlugin} from '@magicflow/plugins';
import {ProcedureDefinition} from '@magicflow/procedure';
import {TaskMetadata} from '@magicflow/task';
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
  definition: ProcedureDefinition;
  plugins?: IPlugin[];
  task?: TaskMetadata;
}

export const FlowViewerContext = createContext<{
  editor: ProcedureEditor;
}>(undefined!);

export const FlowViewer: FC<FlowViewerProps> = forwardRef<
  ProcedureEditor,
  FlowViewerProps
>(({definition, plugins}, ref) => {
  const reRender = useUpdate();

  const editor = useCreation(
    () => new ProcedureEditor(definition, plugins),
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
        flow={editor.rootFlow}
        readonly
        nodeRender={SingleNode}
        nodeNextsRender={node => !node.left}
      />
    </FlowViewerContext.Provider>
  );
});
