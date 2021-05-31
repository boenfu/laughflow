import {IPlugin, PluginConfigComponent} from '@magicflow/plugins';
import {
  Procedure,
  ProcedureDefinition,
  ProcedureFlow,
  ProcedureSingleTreeNode,
  ProcedureTreeView,
  ProcedureUtil,
  SingleNode,
} from '@magicflow/procedure';
import {Operator, compose, updateNode} from '@magicflow/procedure/operators';
import {createEmptyProcedure} from '@magicflow/procedure/utils';
import Eventemitter from 'eventemitter3';
import {enableAllPlugins, produce} from 'immer';
import {compact, fromPairs} from 'lodash-es';
import {createElement} from 'react';

import {NodeRenderDescriptor, buildNodeRenderDescriptor} from '../@common';

import {UndoStack} from './@undo-stack';

type ProcedureEventType = 'update' | 'config';

enableAllPlugins();

export class ProcedureEditor extends Eventemitter<ProcedureEventType> {
  private _definition!: ProcedureDefinition;

  private _treeView!: ProcedureTreeView;

  private plugins: IPlugin[] = [];

  readonly undoStack = new UndoStack();

  nodeRenderDescriptor: NodeRenderDescriptor = {
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
            plugin.editor?.node?.config
              ? [
                  plugin.name,
                  () => {
                    // eslint-disable-next-line @mufan/no-unnecessary-type-assertion
                    let Component = plugin.editor!.node!.config!;

                    return createElement<
                      NonNullable<PluginConfigComponent['defaultProps']>
                    >(Component, {node, value: node.definition, onChange});
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

    this.nodeRenderDescriptor = buildNodeRenderDescriptor(plugins, 'editor');
  }
}
