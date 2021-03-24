import {ProcedureDefinition} from '@magicflow/core';

import {
  IPlugin,
  NodePluginComponent,
  NodePluginComponentProps,
} from '../plugin';

export interface EditorConfigObject {
  [TPluginName: string]: NodePluginComponent;
}

export interface EditorProps {
  definition: ProcedureDefinition;
  plugins?: IPlugin[];
  onConfig?<TPayload>(
    config: EditorConfigObject,
    props: NodePluginComponentProps,
    payload?: TPayload,
  ): void;
}
