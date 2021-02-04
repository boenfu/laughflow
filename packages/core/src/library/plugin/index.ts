import {ComponentType, ReactNode} from 'react';

import {LeafMetadata, NodeId, ProcedureDefinition} from '../core';

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
  render: ReactNode;
  /**
   * 操作所处顺序 (升序)
   */
  actionOrder?: number;
}

export interface ILeafPlugin<TLeafType extends string> {
  type: TLeafType;
  render: ComponentType<PluginLeafElementProps>;
  selectorRender: ComponentType;

  /**
   * 选择器所处顺序 (升序)
   */
  selectorOrder?: number;
  /**
   * 是否支持多次添加
   */
  multiple?: boolean;
  /**
   *
   */
  actions?: ILeafAction[];

  onCreate?: PluginEventHandler;
  onDelete?: PluginEventHandler;
}

export interface IPlugin<TLeafType extends string> {
  leaves?: ILeafPlugin<TLeafType>[];
  onLeafCreate?: PluginEventHandler;
  onLeafDelete?: PluginEventHandler;
}
