import {ComponentType} from 'react';

import {LeafMetadata} from '../core';

export interface PluginLeafElementProps {
  leaf: LeafMetadata;
}

export interface ILeafPlugin<TLeafType extends string> {
  type: TLeafType;
  render: ComponentType<PluginLeafElementProps>;
  selectorRender: ComponentType;
  selectorOrder?: number;
  multiple?: boolean;
}

export interface IPlugin<TLeafType extends string> {
  leaves?: ILeafPlugin<TLeafType>[];
}
