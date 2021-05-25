import {IPlugin} from '@magicflow/plugins';
import {
  FlowId,
  NodeId,
  Procedure,
  ProcedureDefinition,
  ProcedureFlow,
  ProcedureTreeNode,
  ProcedureTreeView,
  ProcedureUtil,
} from '@magicflow/procedure';
import {Operator, compose} from '@magicflow/procedure/operators';
import {createEmptyProcedure} from '@magicflow/procedure/utils';
import Eventemitter from 'eventemitter3';
import {enableAllPlugins, produce} from 'immer';
import {compact, fromPairs, isEqual} from 'lodash-es';

import {NodeRenderDescriptor, buildNodeRenderDescriptor} from '../@common';

import {UndoStack} from './@undo-stack';

type ProcedureEventType = 'update' | 'config';

enableAllPlugins();

export type ActiveState2 = 'connect' | 'cut' | 'copy';

export type ActiveIdentity = (
  | {
      flow: FlowId;
    }
  | {prev: NodeId | FlowId; node: NodeId}
) & {
  state?: ActiveState2;
};

export interface ActiveInfo {
  value: ProcedureTreeNode | ProcedureFlow;
  state?: ActiveState2;
}

export class ProcedureEditor extends Eventemitter<ProcedureEventType> {
  private _definition!: ProcedureDefinition;

  private _treeView!: ProcedureTreeView;

  private _activeIdentity: ActiveIdentity | undefined;

  private plugins: IPlugin[] = [];

  readonly undoStack = new UndoStack();

  activeInfo: ActiveInfo | undefined;

  nodeRenderDescriptor: NodeRenderDescriptor = {
    singleNode: {},
    branchesNode: {},
  };

  private get activeIdentity(): ActiveIdentity | undefined {
    return this._activeIdentity;
  }

  private set activeIdentity(activeIdentity: ActiveIdentity | undefined) {
    this._activeIdentity = activeIdentity;
    this.updateActiveInfo(activeIdentity);
  }

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

  isActive(resource: ProcedureTreeNode | ProcedureFlow): boolean {
    return this.activeInfo?.value.id === resource.id;
  }

  active(identityOrState?: ActiveIdentity | ActiveState2): void {
    if (typeof identityOrState === 'string') {
      if (!this.activeIdentity) {
        return;
      }

      this.activeIdentity = {...this.activeIdentity, state: identityOrState};
    } else {
      this.activeIdentity = identityOrState;
    }
  }

  edit(operator: Operator, keepActive = false): void {
    this.definition = produce(
      this.definition,
      compose([operator]),
      (patches, inversePatches) =>
        this.undoStack.update(patches, inversePatches),
    );

    if (keepActive) {
      return;
    }

    this.active();
  }

  emitConfig<TPayload extends {}>(
    node: ProcedureTreeNode,
    payload?: TPayload,
  ): void {
    this.emit(
      'config',
      fromPairs(
        compact(
          this.plugins.map(plugin =>
            plugin.editor?.[node.type]?.config
              ? [plugin.name, plugin.editor[node.type]!['config']]
              : undefined,
          ),
        ),
      ),
      {
        editor: this,
        node,
      },
      payload,
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

  private updateActiveInfo(activeIdentity: ActiveIdentity | undefined): void {
    let activeInfo: ActiveInfo | undefined;

    if (!activeIdentity) {
      activeInfo = undefined;
    } else {
      let treeView = this._treeView;

      let value =
        'flow' in activeIdentity
          ? treeView.flowsMap.get(activeIdentity.flow)
          : treeView.nodesMapMap
              .get(activeIdentity.node)
              ?.get(activeIdentity.prev);

      activeInfo = value
        ? {
            value,
            state: activeIdentity?.state,
          }
        : undefined;
    }

    let activeInfoChanged = !isEqual(activeInfo, this.activeInfo);

    if (!activeInfoChanged) {
      return;
    }

    this.activeInfo = activeInfo;

    this.emit('update');
  }
}
