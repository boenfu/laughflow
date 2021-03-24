import {
  LeafMetadata,
  NodeMetadata,
  ProcedureDefinition,
  TrunkRef,
} from '@magicflow/core';
import {ComponentType, ReactNode} from 'react';

import {Editor} from '../editor-object';

export interface IPluginEvent {
  definition: ProcedureDefinition;

  stopPropagation(): void;
  preventDefault(): void;
}

export interface PluginLeafEvent extends IPluginEvent {
  trunk: TrunkRef['id'];
  metadata: LeafMetadata;
}

export type PluginEvent = PluginLeafEvent;

export type PluginEventHandler = (event: PluginEvent) => Promise<void> | void;

export interface ILeafPluginEventHandlers {
  onCreate?: PluginEventHandler;
  onDelete?: PluginEventHandler;
}

export interface LeafPluginComponentProps {
  leaf: LeafMetadata;
}

export type LeafPluginComponent = ComponentType<LeafPluginComponentProps>;

export interface IPluginEventHandlers {
  onLeafCreate?: PluginEventHandler;
  onLeafDelete?: PluginEventHandler;
}

export interface NodePluginComponentProps {
  node: NodeMetadata;
  editor: Editor;
  prevChildren?: ReactNode;
  onChange?(next: NodeMetadata): void;
}

export type NodePluginComponent = ComponentType<NodePluginComponentProps>;

export interface NodePluginRenderObject {
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

  config?: NodePluginComponent;
}

export interface INodePlugin {
  render: NodePluginRenderObject;
}

export interface IPlugin extends IPluginEventHandlers {
  name: string;
  node?: INodePlugin;
}
