import {Node} from '@magicflow/core';
import {ProcedureTreeNode} from '@magicflow/procedure';
import {ComponentType, ReactNode} from 'react';

import {ProcedureEditor} from '../procedure-editor';

export interface PluginComponentProps {
  editor: ProcedureEditor;
  node: ProcedureTreeNode;
  prevChildren?: ReactNode;
}

export type PluginComponent<TProps = {}> = ComponentType<
  PluginComponentProps & TProps
>;

export type PluginConfigComponent<TProps = {}> = PluginComponent<
  TProps & {
    value: Node;
    onChange(node: Node): void;
  }
>;

export interface IPlugin<TConfigExtraProps = {}> {
  name: string;
  singleNode?: {
    before?: PluginComponent;
    after?: PluginComponent;
    headLeft?: PluginComponent;
    headRight?: PluginComponent;
    /**
     * default `flex-direction: column`
     */
    body?: PluginComponent;
    /**
     * default `flex-direction: row`
     */
    footer?: PluginComponent;
    config?: PluginConfigComponent<TConfigExtraProps>;
  };
  branchesNode?: {
    before?: PluginComponent;
    after?: PluginComponent;
    config?: PluginConfigComponent<TConfigExtraProps>;
  };
}
