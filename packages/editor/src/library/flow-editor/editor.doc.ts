import {Procedure} from '@magicflow/core';

import {IPlugin, PluginComponent, PluginComponentProps} from '../plugin';

export interface EditorConfigObject {
  [TPluginName: string]: PluginComponent;
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
