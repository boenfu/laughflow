import {IPlugin} from '@magicflow/plugins';
import {ProcedureDefinition} from '@magicflow/procedure';
import {useCreation, useUpdate} from 'ahooks';
import React, {
  FC,
  createContext,
  forwardRef,
  useEffect,
  useImperativeHandle,
} from 'react';

import {FlowSkeleton} from '../flow-skeleton';
import {ProcedureEditor, createNode} from '../procedure-editor';

import {Footer} from './@footer';
import {SingleNode} from './@node';

export interface FlowEditorProps {
  definition: ProcedureDefinition;
  plugins?: IPlugin[];
  onChange?(definition: ProcedureDefinition): void;
  // onConfig?<TPayload>(
  //   config: EditorConfigObject,
  //   props: PluginComponentProps,
  //   payload?: TPayload,
  // ): void;
}

export const FlowEditorContext = createContext<{
  editor: ProcedureEditor;
}>(undefined!);

export const FlowEditor: FC<FlowEditorProps> = forwardRef<
  ProcedureEditor,
  FlowEditorProps
>(({definition, plugins, onChange}, ref) => {
  const editor = useCreation(
    () => new ProcedureEditor(definition, plugins),
    [],
  );
  const reRender = useUpdate();

  useEffect(() => {
    editor.on('update', () => {
      onChange?.(editor.definition);
      reRender();
    });

    // if (onConfig) {
    //   editor.on('config', onConfig);
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => editor);

  return (
    <FlowEditorContext.Provider value={{editor}}>
      <FlowSkeleton
        flow={editor.rootFlow}
        onAction={action => {
          console.log(action);

          switch (action.type) {
            case 'node:add-node':
              editor.edit(
                createNode({
                  type: 'singleNode',
                  from: action.target.id,
                }),
              );

              break;
            case 'branches-node:add-node':
              // let a = action.target;
              break;
            default:
              break;
          }
        }}
        nodeRender={SingleNode}
      >
        <Footer />
      </FlowSkeleton>
    </FlowEditorContext.Provider>
  );
});
