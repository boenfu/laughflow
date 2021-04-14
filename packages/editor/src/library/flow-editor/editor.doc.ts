import {Procedure} from '@magicflow/core';

import {IPlugin, PluginComponentProps, PluginConfigComponent} from '../plugin';

export interface EditorConfigObject {
  [TPluginName: string]: PluginConfigComponent;
}

export interface EditorProps {
  definition: Procedure;
  plugins?: IPlugin[];
  onConfig?<TPayload>(
    config: EditorConfigObject,
    props: PluginComponentProps,
    payload?: TPayload,
  ): void;
}
