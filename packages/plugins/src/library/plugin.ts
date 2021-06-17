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

export interface NodeRender<TNode, TConfigExtraProps = any> {
  before?: PluginRenderComponent<TNode>;
  after?: PluginRenderComponent<TNode>;
  headLeft?: PluginRenderComponent<TNode>;
  headRight?: PluginRenderComponent<TNode>;
  body?: PluginRenderComponent<TNode>;
  footer?: PluginRenderComponent<TNode>;
  config?: PluginConfigComponent<TConfigExtraProps>;
}

export type NodeViewerRender<TNode> = Omit<NodeRender<TNode>, 'config'>;

export interface ProcedureRender<TConfigExtraProps = any> {
  node?: NodeRender<ProcedureSingleTreeNode, TConfigExtraProps>;
}

export interface TaskRender {
  node?: NodeViewerRender<TaskSingleNode>;
}

export interface IProcedurePlugin<TConfigExtraProps = any> {
  render: ProcedureRender<TConfigExtraProps>;
}

export interface ITaskPlugin {
  render: TaskRender;
  runtime: ITaskRuntime;
}

export interface IPlugin<TConfigExtraProps = any> {
  name: string;

  procedure?: IProcedurePlugin<TConfigExtraProps>;

  task?: ITaskPlugin;
}
