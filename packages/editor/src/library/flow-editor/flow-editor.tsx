import {IPlugin} from '@magicflow/plugins';
import {
  ProcedureBranchesTreeNode,
  ProcedureDefinition,
  ProcedureFlow,
  ProcedureSingleTreeNode,
} from '@magicflow/procedure';
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

  useKeyPress('ctrl.z', () => {
    if (window.document.activeElement !== window.document.body) {
      return;
    }

    editor.undo();
  });
  useKeyPress('ctrl.y', () => {
    if (window.document.activeElement !== window.document.body) {
      return;
    }

    editor.redo();
  });

  useImperativeHandle(ref, () => editor);

  return (
    <FlowEditorContext.Provider value={{editor}}>
      <FlowSkeleton
        flow={editor.rootFlow}
        onAction={action => actionHandler(editor, action)}
        nodeRender={SingleNode}
        nodeNextsRender={node => !node.left}
        activeFormatter={active => findFlowById(editor.rootFlow, active.id)}
      >
        <Footer />
      </FlowSkeleton>
    </FlowEditorContext.Provider>
  );
});

function findFlowById(
  procedureFlow: ProcedureFlow,
  id: string,
):
  | ProcedureSingleTreeNode
  | ProcedureBranchesTreeNode
  | ProcedureFlow
  | undefined {
  if (procedureFlow.id === id) {
    return procedureFlow;
  }

  for (let node of procedureFlow.starts) {
    let ret = findNodeById(node, id);

    if (ret) {
      return ret;
    }
  }

  return undefined;
}

function findNodeById(
  node: ProcedureSingleTreeNode | ProcedureBranchesTreeNode,
  id: string,
):
  | ProcedureSingleTreeNode
  | ProcedureBranchesTreeNode
  | ProcedureFlow
  | undefined {
  if (node.id === id) {
    return node;
  }

  // 在 flow editor 中，link 节点无法被选中
  if (node.left) {
    return undefined;
  }

  if ('flows' in node) {
    for (let flow of node.flows) {
      let ret = findFlowById(flow, id);

      if (ret) {
        return ret;
      }
    }
  }

  for (let next of node.nexts) {
    let ret = findNodeById(next, id);

    if (ret) {
      return ret;
    }
  }

  return undefined;
}
