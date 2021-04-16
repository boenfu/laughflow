import {Node, NodeType} from '@magicflow/core';
import {ProcedureTreeNode} from '@magicflow/procedure';
import {TaskContext} from '@magicflow/task';
import {ComponentType, ReactNode} from 'react';
import {Dict} from 'tslang';

import {ProcedureEditor} from '../procedure-editor';

export interface PluginComponentProps<TType extends NodeType = NodeType> {
  editor: ProcedureEditor;
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

export interface IPlugin<TConfigExtraProps extends Dict<any> = Dict<any>> {
  name: string;
  singleNode?: {
    before?: PluginComponent<'singleNode'>;
    after?: PluginComponent<'singleNode'>;
    headLeft?: PluginComponent<'singleNode'>;
    headRight?: PluginComponent<'singleNode'>;
    /**
     * default `flex-direction: column`
     */
    body?: PluginComponent<'singleNode'>;
    /**
     * default `flex-direction: row`
     */
    footer?: PluginComponent<'singleNode'>;
    config?: PluginConfigComponent<'singleNode', TConfigExtraProps>;
  };
  branchesNode?: {
    before?: PluginComponent<'branchesNode'>;
    after?: PluginComponent<'branchesNode'>;
    config?: PluginConfigComponent<'branchesNode', TConfigExtraProps>;
  };

  task: {
    context: TaskContext;
  };
}
