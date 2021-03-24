import {
  LeafMetadata,
  LeafType,
  NodeMetadata,
  ProcedureDefinition,
  TrunkRef,
} from '@magicflow/core';
import {ComponentType, ReactNode} from 'react';
import {Nominal} from 'tslang';

import {Editor} from '../editor-object';

export type LeafPluginType = Nominal<string, ['leaf-plugin-type']>;

export interface IPluginEvent {
  definition: ProcedureDefinition;

  stopPropagation(): void;
  preventDefault(): void;
}

export type PluginLeafEventType = 'create' | 'delete';

export interface PluginLeafEvent extends IPluginEvent {
  type: PluginLeafEventType;
  trunk: TrunkRef['id'];
  metadata: LeafMetadata;
}

export type PluginEvent = PluginLeafEvent;

export type PluginEventHandler = (event: PluginEvent) => Promise<void> | void;

export interface LeafAction {
  label: string;
  icon?: ComponentType;

  /**
   * 操作所处顺序 (升序)
   */
  order?: number;
}

export interface LeafSelector {
  render: ComponentType;

  /**
   * 选择器所处顺序 (升序)
   */
  order?: number;
  /**
   * 是否支持多次添加
   */
  multiple?: boolean;
}

export interface ILeafPluginEventHandlers {
  onCreate?: PluginEventHandler;
  onDelete?: PluginEventHandler;
}

export interface LeafPluginComponentProps {
  leaf: LeafMetadata;
}

export type LeafPluginComponent = ComponentType<LeafPluginComponentProps>;

export interface ILeafPlugin extends ILeafPluginEventHandlers {
  /**
   * `type` 相同的 LeafPlugin:
   * 仅 最后一个 `render` 与 `selector` 生效
   * `actions` 将合并
   */
  type: LeafType;

  render?: LeafPluginComponent;
  selector?: LeafSelector;
  actions?: LeafAction[];
}

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
  leaves?: ILeafPlugin[];
}
