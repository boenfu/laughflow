import {Procedure} from '@magicflow/core';
import {
  IPlugin,
  PluginComponentProps,
  PluginConfigComponent,
} from '@magicflow/plugins';

export interface EditorConfigObject {
  [TPluginName: string]: PluginConfigComponent;
}

export interface EditorProps {
  definition: Procedure;
  plugins?: IPlugin[];
  onChange?(definition: Procedure): void;
  onConfig?<TPayload>(
    config: EditorConfigObject,
    props: PluginComponentProps,
    payload?: TPayload,
  ): void;
}
