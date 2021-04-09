import {Flow, Leaf, SingleNode} from '@magicflow/core';
import {ComponentType, ReactNode} from 'react';

import {Editor} from '../procedure-editor/procedure-editor';

export interface IPluginEvent {
  definition: Flow;

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

export interface LeafPluginComponentProps {
  leaf: Leaf;
}

export type LeafPluginComponent = ComponentType<LeafPluginComponentProps>;

export interface NodePluginComponentProps {
  node: SingleNode;
  editor: Editor;
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

export interface INodePlugin<TConfigExtraProps = {}> {
  render: NodePluginRenderObject<TConfigExtraProps>;
  onUpdate?: PluginNodeEventHandler;
}

export interface IPlugin<TConfigExtraProps = {}> {
  name: string;
  node?: INodePlugin<TConfigExtraProps>;
}
