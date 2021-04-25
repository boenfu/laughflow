import {
  BranchesNodeEditorRender,
  IPlugin,
  SingleNodeEditorRender,
} from '@magicflow/plugins';
import {
  FlowId,
  NodeId,
  Procedure,
  ProcedureDefinition,
  ProcedureFlow,
  ProcedureTreeView,
  ProcedureUtil,
} from '@magicflow/procedure';
import {Operator, compose} from '@magicflow/procedure/operators';
import {createEmptyProcedure} from '@magicflow/procedure/utils';
import Eventemitter from 'eventemitter3';
import {enableAllPlugins, produce} from 'immer';

type ProcedureEventType = 'update' | 'config';

enableAllPlugins();

export type ActiveState = 'connect' | 'cut' | 'copy';

export type ActiveIdentity = (
  | {
      flow: FlowId;
    }
  | {prev: NodeId | FlowId; node: NodeId}
) & {
  state?: ActiveState;
};

export type NodeRenderCollect<TRender extends object> = {
  [TK in keyof TRender]: NonNullable<TRender[TK]>[];
};

export interface NodeRenderDescriptor {
  singleNode: NodeRenderCollect<NonNullable<SingleNodeEditorRender>>;
  branchesNode: NodeRenderCollect<NonNullable<BranchesNodeEditorRender>>;
}

export class ProcedureViewer extends Eventemitter<ProcedureEventType> {
  private _definition!: ProcedureDefinition;

  private _treeView!: ProcedureTreeView;

  // private plugins: IPlugin[] = [];

  nodeRenderDescriptor: NodeRenderDescriptor = {
    singleNode: {},
    branchesNode: {},
  };

  get definition(): ProcedureDefinition {
    return this._definition;
  }

  set definition(definition: ProcedureDefinition) {
    this._definition = ProcedureUtil.cloneDeep(definition);
    this._treeView = new Procedure(definition).treeView;
    this.emit('update');
  }

  get rootFlow(): ProcedureFlow {
    return this._treeView.root;
  }

  constructor(
    definition: ProcedureDefinition = createEmptyProcedure(),
    plugins: IPlugin[] = [],
  ) {
    super();

    this.definition = definition;
    this.setPlugins(plugins);
  }

  edit(operator: Operator, keepActive = false): void {
    this.definition = produce(this.definition, compose([operator]));

    if (keepActive) {
      return;
    }
  }

  private setPlugins(plugins: IPlugin[]): void {
    // this.plugins = plugins;

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
      let {singleNode, branchesNode} = plugin.editor || {};

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

    this.nodeRenderDescriptor = nodeRenderDescriptor;
  }
}
