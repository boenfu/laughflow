import {Flow} from '@magicflow/core';

import {
  IPlugin,
  NodePluginComponent,
  NodePluginComponentProps,
} from '../plugin';

export interface EditorConfigObject {
  [TPluginName: string]: NodePluginComponent;
}

export interface EditorProps {
  definition: Flow;
  plugins?: IPlugin[];
  onConfig?<TPayload>(
    config: EditorConfigObject,
    props: NodePluginComponentProps,
    payload?: TPayload,
  ): void;
}
