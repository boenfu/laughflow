import {Procedure, SingleNode} from '@magicflow/core';
import {ComponentType, ReactNode} from 'react';

import {ProcedureEditor} from '../procedure-editor';

export interface IPluginEvent {
  definition: Procedure;

  stopPropagation(): void;
  preventDefault(): void;
}

export interface PluginNodeEvent extends IPluginEvent {
  currentNode: SingleNode;
  nextNode: SingleNode;
}

export type PluginNodeEventHandler = (
  event: PluginNodeEvent,
) => Promise<void> | void;

export interface NodePluginComponentProps {
  node: SingleNode;
  editor: ProcedureEditor;
  prevChildren?: ReactNode;
  onChange?(next: SingleNode): void;
}

export type NodePluginComponent<TProps = {}> = ComponentType<
  NodePluginComponentProps & TProps
>;

export interface NodePluginRenderObject<TConfigExtraProps = {}> {
  before?: NodePluginComponent;
  after?: NodePluginComponent;

  headLeft?: NodePluginComponent;
  headRight?: NodePluginComponent;

  /**
   * default `flex-direction: column`
   */
  body?: NodePluginComponent;
  /**
   * default `flex-direction: row`
   */
  footer?: NodePluginComponent;

  config?: NodePluginComponent<TConfigExtraProps>;
}

export interface IPlugin<TConfigExtraProps = {}> {
  name: string;
  render: NodePluginRenderObject<TConfigExtraProps>;
  onUpdate?: PluginNodeEventHandler;
}
