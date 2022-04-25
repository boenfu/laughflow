import type {
  IPlugin,
  NodeRender,
  PluginConfigComponent,
} from '@laughflow/plugins';
import type {
  ProcedureDefinition,
  ProcedureFlow,
  ProcedureSingleTreeNode,
  ProcedureTreeView,
  SingleNode,
} from '@laughflow/procedure';
import {Procedure, ProcedureUtil} from '@laughflow/procedure';
import type {Operator} from '@laughflow/procedure/operators';
import {compose, updateNode} from '@laughflow/procedure/operators';
import {createEmptyProcedure} from '@laughflow/procedure/utils';
import Eventemitter from 'eventemitter3';
import {enableAllPlugins, produce} from 'immer';
import {compact, fromPairs} from 'lodash-es';
import type {ComponentType} from 'react';
import {createElement} from 'react';

import {UndoStack} from './@undo-stack';

type ProcedureEventType = 'update' | 'config';

enableAllPlugins();

export class ProcedureEditor extends Eventemitter<ProcedureEventType> {
  private _definition!: ProcedureDefinition;

  private _treeView!: ProcedureTreeView;

  private plugins: IPlugin[] = [];

  readonly undoStack = new UndoStack();

  nodeRenderDescriptorDict: {
    procedure: NodeRenderDescriptor;
    task: NodeRenderDescriptor;
  } = {
    procedure: {node: {}},
    task: {node: {}},
  };

  taskNodeRenderDescriptor: NodeRenderDescriptor = {
    node: {},
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

  edit(operator: Operator): void {
    this.definition = produce(
      this.definition,
      compose([operator]),
      (patches, inversePatches) =>
        this.undoStack.update(patches, inversePatches),
    );
  }

  emitConfig<TPayload extends {}>(
    node: ProcedureSingleTreeNode,
    payload?: TPayload,
  ): void {
    let onChange = (node: SingleNode): void => void this.edit(updateNode(node));

    this.emit(
      'config',
      fromPairs(
        compact(
          this.plugins.map(plugin =>
            plugin.procedure?.render.node?.config
              ? [
                  plugin.name,
                  () => {
                    let Component = plugin.procedure!.render.node!.config!;

                    return createElement<
                      NonNullable<PluginConfigComponent['defaultProps']>
                    >(Component, {
                      node,
                      value: node.definition,
                      onChange,
                    });
                  },
                ]
              : undefined,
          ),
        ),
      ),
      {
        editor: this,
        node,
        payload,
      },
    );
  }

  undo(): void {
    this.definition = this.undoStack.undo(this.definition);
  }

  redo(): void {
    this.definition = this.undoStack.redo(this.definition);
  }

  private setPlugins(plugins: IPlugin[]): void {
    this.plugins = plugins;

    this.nodeRenderDescriptorDict = {
      procedure: buildNodeRenderDescriptor(plugins, 'procedure'),
      task: buildNodeRenderDescriptor(plugins, 'task'),
    };
  }
}

export interface NodeRenderDescriptor {
  node: Partial<Record<keyof NodeRender<unknown>, ComponentType<any>[]>>;
}

export function buildNodeRenderDescriptor(
  plugins: IPlugin[],
  type: 'procedure' | 'task',
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
    let {node} = plugin[type]?.render || {};

    if (node) {
      for (let [name, component] of Object.entries(node)) {
        if (component) {
          nodeRenderDescriptor['node'][
            name as keyof NodeRenderDescriptor['node']
          ]!.push(component);
        }
      }
    }
  }

  return nodeRenderDescriptor;
}
