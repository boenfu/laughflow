import {ProcedureSingleTreeNode, SingleNode} from '@magicflow/procedure';
import {ITaskRuntime} from '@magicflow/task';
import {ComponentType, ReactNode} from 'react';

export type PluginRenderComponent = ComponentType<{
  node: ProcedureSingleTreeNode;
  prevChildren?: ReactNode;
}>;

export type PluginConfigComponent<TProps = {}> = ComponentType<
  TProps & {
    node: ProcedureSingleTreeNode;
    value: SingleNode;
    onChange(node: SingleNode): void;
  }
>;

export interface NodeEditorRender<TConfigExtraProps = {}> {
  before?: PluginRenderComponent;
  after?: PluginRenderComponent;
  headLeft?: PluginRenderComponent;
  headRight?: PluginRenderComponent;
  body?: PluginRenderComponent;
  footer?: PluginRenderComponent;
  config?: PluginConfigComponent<TConfigExtraProps>;
}

export type NodeViewerRender = Omit<NodeEditorRender, 'config'>;

export interface EditorRender<TConfigExtraProps = {}> {
  node?: NodeEditorRender<TConfigExtraProps>;
}

export interface ViewerRender {
  node?: NodeViewerRender;
}

export interface IPlugin<TConfigExtraProps = {}> {
  name: string;

  editor?: EditorRender<TConfigExtraProps>;

  viewer?: ViewerRender;

  task?: ITaskRuntime;
}
