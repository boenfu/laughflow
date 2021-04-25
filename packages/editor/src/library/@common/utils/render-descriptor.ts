import {
  BranchesNodeEditorRender,
  IPlugin,
  SingleNodeEditorRender,
} from '@magicflow/plugins';

export type NodeRenderCollect<TRender extends object> = {
  [TK in keyof TRender]: NonNullable<TRender[TK]>[];
};

export interface NodeRenderDescriptor {
  singleNode: NodeRenderCollect<NonNullable<SingleNodeEditorRender>>;
  branchesNode: NodeRenderCollect<NonNullable<BranchesNodeEditorRender>>;
}

export function buildNodeRenderDescriptor(
  plugins: IPlugin[],
  type: 'editor' | 'viewer',
): NodeRenderDescriptor {
  let nodeRenderDescriptor: NodeRenderDescriptor = {
    singleNode: {
      before: [],
      after: [],
      headLeft: [],
      headRight: [],
      body: [],
      footer: [],
      config: [],
    },
    branchesNode: {
      before: [],
      after: [],
      config: [],
    },
  };

  for (let plugin of plugins) {
    let {singleNode, branchesNode} = plugin[type] || {};

    if (singleNode) {
      for (let [name, component] of Object.entries(singleNode)) {
        if (component) {
          // eslint-disable-next-line @mufan/no-unnecessary-type-assertion
          nodeRenderDescriptor['singleNode'][
            name as keyof NodeRenderDescriptor['singleNode']
          ]!.push(component as any);
        }
      }
    }

    if (branchesNode) {
      for (let [name, component] of Object.entries(branchesNode)) {
        if (component) {
          // eslint-disable-next-line @mufan/no-unnecessary-type-assertion
          nodeRenderDescriptor['branchesNode'][
            name as keyof NodeRenderDescriptor['branchesNode']
          ]!.push(component as any);
        }
      }
    }
  }

  return nodeRenderDescriptor;
}
