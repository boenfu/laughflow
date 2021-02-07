import {ComponentType} from 'react';

import {
  LeafMetadata,
  LeafType,
  NodeId,
  Procedure,
  ProcedureDefinition,
} from '../core';
import {
  ILeafAction,
  ILeafSelector,
  IPlugin,
  PluginLeafElementProps,
} from '../plugin';

export interface EditorProps {
  definition: ProcedureDefinition;
  onInsertLeaf?(
    type: LeafType,
    node: NodeId,
    context: {
      procedure: Procedure;
      metadata: Partial<LeafMetadata>;
    },
  ): boolean | Partial<LeafMetadata>;
  plugins?: IPlugin[];
}

export interface LeafRenderDescriptors {
  type: LeafType;
  render: ComponentType<PluginLeafElementProps>;
  selector: ILeafSelector;
  actions: ILeafAction[];
}
