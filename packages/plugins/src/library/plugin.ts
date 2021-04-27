import {Node, NodeType, ProcedureTreeNode} from '@magicflow/procedure';
import {ITaskRuntime} from '@magicflow/task';
import {ComponentType, ReactNode} from 'react';

export interface PluginComponentProps<TType extends NodeType = NodeType> {
  node: Extract<ProcedureTreeNode, {type: TType}>;
  prevChildren?: ReactNode;
}

export type PluginComponent<
  TType extends NodeType,
  TProps = {}
> = ComponentType<PluginComponentProps<TType> & TProps>;

export type PluginConfigComponent<
  TType extends NodeType = NodeType,
  TProps = {}
> = PluginComponent<
  TType,
  TProps & {
    value: Extract<Node, {type: TType}>;
    onChange(node: Extract<Node, {type: TType}>): void;
  }
>;

export interface SingleNodeEditorRender<TConfigExtraProps = any> {
  before?: PluginComponent<'singleNode'>;
  after?: PluginComponent<'singleNode'>;
  headLeft?: PluginComponent<'singleNode'>;
  headRight?: PluginComponent<'singleNode'>;
  body?: PluginComponent<'singleNode'>;
  footer?: PluginComponent<'singleNode'>;
  config?: PluginConfigComponent<'singleNode', TConfigExtraProps>;
}

export type SingleNodeViewerRender = Omit<SingleNodeEditorRender, 'config'>;

export interface BranchesNodeEditorRender<TConfigExtraProps = any> {
  before?: PluginComponent<'branchesNode'>;
  after?: PluginComponent<'branchesNode'>;
  config?: PluginConfigComponent<'branchesNode', TConfigExtraProps>;
}

export type BranchesNodeViewerRender = Omit<BranchesNodeEditorRender, 'config'>;

export interface EditorRender<TConfigExtraProps = any> {
  singleNode?: SingleNodeEditorRender<TConfigExtraProps>;
  branchesNode?: BranchesNodeEditorRender<TConfigExtraProps>;
}

export interface ViewerRender {
  singleNode?: SingleNodeViewerRender;
  branchesNode?: BranchesNodeViewerRender;
}

export interface IPlugin<TConfigExtraProps = any> {
  name: string;

  editor?: EditorRender<TConfigExtraProps>;

  viewer?: ViewerRender;

  task?: ITaskRuntime;
}
