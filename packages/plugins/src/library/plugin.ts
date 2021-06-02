import {ProcedureSingleTreeNode, SingleNode} from '@magicflow/procedure';
import {ITaskRuntime, TaskSingleNode} from '@magicflow/task';
import {ComponentType, ReactNode} from 'react';

export type PluginRenderComponent<TNode> = ComponentType<{
  node: TNode;
  prevChildren?: ReactNode;
}>;

export type PluginConfigComponent<TProps = any> = ComponentType<
  TProps & {
    node: ProcedureSingleTreeNode;
    value: SingleNode;
    onChange(node: SingleNode): void;
  }
>;

export interface NodeEditorRender<TNode, TConfigExtraProps = any> {
  before?: PluginRenderComponent<TNode>;
  after?: PluginRenderComponent<TNode>;
  headLeft?: PluginRenderComponent<TNode>;
  headRight?: PluginRenderComponent<TNode>;
  body?: PluginRenderComponent<TNode>;
  footer?: PluginRenderComponent<TNode>;
  config?: PluginConfigComponent<TConfigExtraProps>;
}

export type NodeViewerRender<TNode> = Omit<NodeEditorRender<TNode>, 'config'>;

export interface EditorRender<TConfigExtraProps = any> {
  node?: NodeEditorRender<ProcedureSingleTreeNode, TConfigExtraProps>;
}

export interface ViewerRender {
  node?: NodeViewerRender<TaskSingleNode>;
}

export interface IPlugin<TConfigExtraProps = any> {
  name: string;

  editor?: EditorRender<TConfigExtraProps>;

  viewer?: ViewerRender;

  task?: ITaskRuntime;
}
