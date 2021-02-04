import {ComponentType} from 'react';

import {LeafMetadata, NodeId, ProcedureDefinition} from '../core';

export interface PluginLeafElementProps {
  leaf: LeafMetadata;
}

export interface PluginEvent {
  metadata: LeafMetadata;
  definition: ProcedureDefinition;
  target: NodeId;
  stopPropagation(): void;
  preventDefault(): void;
}

export type PluginEventHandler = (event: PluginEvent) => Promise<void> | void;

export interface ILeafPlugin<TLeafType extends string> {
  type: TLeafType;
  render: ComponentType<PluginLeafElementProps>;
  selectorRender: ComponentType;
  selectorOrder?: number;
  multiple?: boolean;
  onCreate?: PluginEventHandler;
  onDelete?: PluginEventHandler;
}

export interface IPlugin<TLeafType extends string> {
  leaves?: ILeafPlugin<TLeafType>[];
  onLeafCreate?: PluginEventHandler;
  onLeafDelete?: PluginEventHandler;
}
