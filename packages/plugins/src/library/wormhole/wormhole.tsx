import 'rc-dropdown/assets/index.css';

import {
  ILeafPlugin,
  IPlugin,
  LeafPluginType,
  NodeId,
  PluginEvent,
  PluginEventHandler,
} from '@magicflow/core';
import _Menu, {MenuProps} from 'rc-menu';
import React, {FC} from 'react';

import {WormholeLeaf} from './@leaf';
import {Selector} from './@selector';

declare module '@magicflow/core' {
  interface LeafMetadata {
    target?: NodeId;
  }
}

export class WormholePlugin implements IPlugin {
  private selectingState:
    | ({
        resolver: () => void;
      } & PluginEvent)
    | undefined;

  leaves: ILeafPlugin[];

  constructor() {
    this.leaves = [
      {
        type: 'wormhole' as LeafPluginType,
        render: WormholeLeaf,
        selector: {
          multiple: true,
          render: this.selectorRender,
        },
        onCreate: this.onCreate,
      },
    ];
  }

  private selectorRender: FC = () => (
    <Selector onSelect={this.onSelect} onVisibleChange={this.onVisibleChange} />
  );

  private onCreate: PluginEventHandler = event => {
    return new Promise(resolve => {
      this.selectingState = {
        ...event,
        resolver: resolve,
      };
    });
  };

  private onVisibleChange = (visible: boolean): void => {
    if (visible) {
      return;
    }

    let selectingState = this.selectingState;

    if (!selectingState) {
      return;
    }

    let {resolver, preventDefault} = selectingState;

    preventDefault();
    resolver();

    this.selectingState = undefined;
  };

  private onSelect: MenuProps['onSelect'] = ({key}): void => {
    let selectingState = this.selectingState;

    if (!selectingState) {
      return;
    }

    let {resolver, metadata} = selectingState;

    metadata.target = key as NodeId;
    resolver();
    this.selectingState = undefined;
  };
}
