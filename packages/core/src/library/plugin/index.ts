import {ComponentType} from 'react';

import {LeafMetadata, LeafType, NodeId, ProcedureDefinition} from '../core';

export interface PluginLeafElementProps {
  leaf: LeafMetadata;
}

export type PluginEvent = PluginEventContextPartial & PluginEventProcessPartial;

export interface PluginEventContextPartial {
  metadata: LeafMetadata;
  definition: ProcedureDefinition;
  target: NodeId;
}

export interface PluginEventProcessPartial {
  stopPropagation(): void;
  preventDefault(): void;
}

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

export interface ILeafPlugin {
  /**
   * `type` 相同的 LeafPlugin:
   * 仅 最后一个 `render` 与 `selector` 生效
   * `actions` 将合并
   */
  type: LeafType;

  render?: ComponentType<PluginLeafElementProps>;
  selector?: ILeafSelector;
  actions?: ILeafAction[];

  onCreate?: PluginEventHandler;
  onDelete?: PluginEventHandler;
}

export interface IPlugin {
  leaves?: ILeafPlugin[];
  onLeafCreate?: PluginEventHandler;
  onLeafDelete?: PluginEventHandler;
}
