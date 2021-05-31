import {IPlugin, NodeEditorRender} from '@magicflow/plugins';

export type NodeRenderCollect<TRender extends object> = {
  [TK in keyof TRender]: NonNullable<TRender[TK]>[];
};

export interface NodeRenderDescriptor {
  node: NodeRenderCollect<NonNullable<NodeEditorRender>>;
}

export function buildNodeRenderDescriptor(
  plugins: IPlugin[],
  type: 'editor' | 'viewer',
): NodeRenderDescriptor {
  let nodeRenderDescriptor: NodeRenderDescriptor = {
    node: {
      before: [],
      after: [],
      headLeft: [],
      headRight: [],
      body: [],
      footer: [],
      config: [],
    },
  };

  for (let plugin of plugins) {
    let {node} = plugin[type] || {};

    if (node) {
      for (let [name, component] of Object.entries(node)) {
        if (component) {
          // eslint-disable-next-line @mufan/no-unnecessary-type-assertion
          nodeRenderDescriptor['node'][
            name as keyof NodeRenderDescriptor['node']
          ]!.push(component);
        }
      }
    }
  }

  return nodeRenderDescriptor;
}
