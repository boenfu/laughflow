import {ComponentType} from 'react';

import {LeafMetadata, LeafType, NodeId, ProcedureDefinition} from '../core';

export interface IPluginEvent {
  definition: ProcedureDefinition;

  stopPropagation(): void;
  preventDefault(): void;
}

export type PluginLeafEventType = 'create' | 'delete';

export interface PluginLeafEvent extends IPluginEvent {
  type: PluginLeafEventType;
  node: NodeId;
  metadata: LeafMetadata;
}

export type PluginEvent = PluginLeafEvent;

export type PluginEventHandler = (event: PluginEvent) => Promise<void> | void;

export interface ILeafAction {
  label: string;
  icon?: ComponentType;

  /**
   * 操作所处顺序 (升序)
   */
  order?: number;
}

export interface ILeafSelector {
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

export interface PluginLeafElementProps {
  leaf: LeafMetadata;
}

export interface ILeafPlugin extends ILeafPluginEventHandlers {
  /**
   * `type` 相同的 LeafPlugin:
   * 仅 最后一个 `render` 与 `selector` 生效
   * `actions` 将合并
   */
  type: LeafType;

  render?: ComponentType<PluginLeafElementProps>;
  selector?: ILeafSelector;
  actions?: ILeafAction[];
}

export interface IPluginEventHandlers {
  onLeafCreate?: PluginEventHandler;
  onLeafDelete?: PluginEventHandler;
}

export interface IPlugin extends IPluginEventHandlers {
  leaves?: ILeafPlugin[];
}
