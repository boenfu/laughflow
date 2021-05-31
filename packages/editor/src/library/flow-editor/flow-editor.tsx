import {IPlugin} from '@magicflow/plugins';
import {ProcedureDefinition} from '@magicflow/procedure';
import {useCreation, useKeyPress, useUpdate} from 'ahooks';
import React, {
  ComponentType,
  FC,
  createContext,
  forwardRef,
  useEffect,
  useImperativeHandle,
} from 'react';

import {FlowSkeleton} from '../flow-skeleton';
import {ProcedureEditor} from '../procedure-editor';

import {Footer} from './@footer';
import {actionHandler} from './@handler';
import {SingleNode} from './@node';

export interface FlowEditorProps {
  definition: ProcedureDefinition;
  plugins?: IPlugin[];
  onChange?(definition: ProcedureDefinition): void;
  onConfig?(config: {[key in IPlugin['name']]: ComponentType}): void;
}

export const FlowEditorContext = createContext<{
  editor: ProcedureEditor;
}>(undefined!);

export const FlowEditor: FC<FlowEditorProps> = forwardRef<
  ProcedureEditor,
  FlowEditorProps
>(({definition, plugins, onChange, onConfig}, ref) => {
  const reRender = useUpdate();

  const editor = useCreation(
    () => new ProcedureEditor(definition, plugins),
    [],
  );

  useEffect(() => {
    editor.on('update', () => {
      onChange?.(editor.definition);
      reRender();
    });

    if (onConfig) {
      editor.on('config', onConfig);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useKeyPress('ctrl.z', () => editor.undo());
  useKeyPress('ctrl.y', () => editor.redo());

  useImperativeHandle(ref, () => editor);

  return (
    <FlowEditorContext.Provider value={{editor}}>
      <FlowSkeleton
        flow={editor.rootFlow}
        onAction={action => actionHandler(editor, action)}
        nodeRender={SingleNode}
        nodeNextsRender={node => !node.left}
      >
        <Footer />
      </FlowSkeleton>
    </FlowEditorContext.Provider>
  );
});
