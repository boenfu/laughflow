import {
  FlowId,
  NodeId,
  Procedure as ProcedureDefinition,
} from '@magicflow/core';
import {
  Procedure,
  ProcedureFlow,
  ProcedureTreeNode,
  ProcedureTreeView,
  ProcedureUtil,
} from '@magicflow/procedure';
import {Operator} from '@magicflow/procedure/operators';
import {createEmptyProcedure} from '@magicflow/procedure/utils';
import Eventemitter from 'eventemitter3';
import {enableAllPlugins, produce} from 'immer';

import {UndoStack} from './@undo-stack';

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

export interface ActiveInfo {
  value: ProcedureTreeNode | ProcedureFlow;
  state?: ActiveState;
}

export class ProcedureEditor extends Eventemitter<ProcedureEventType> {
  private _definition!: ProcedureDefinition;

  private _treeView!: ProcedureTreeView;

  private _activeIdentity: ActiveIdentity | undefined;

  readonly undoStack = new UndoStack();

  nodeRenderDescriptor: {
    before?: any;
    after?: any;
    headLeft?: any;
    headRight?: any;
    footer?: any;
    body?: any;
  } = {};

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

  get activeInfo(): ActiveInfo | undefined {
    let activeIdentity = this._activeIdentity;

    if (!activeIdentity) {
      return undefined;
    }

    let treeView = this._treeView;

    let value =
      'flow' in activeIdentity
        ? treeView.flowsMap.get(activeIdentity.flow)
        : treeView.nodesMapMap
            .get(activeIdentity.node)
            ?.get(activeIdentity.prev);

    if (!value) {
      return undefined;
    }

    return {
      value,
      state: this._activeIdentity?.state,
    };
  }

  constructor(definition: ProcedureDefinition = createEmptyProcedure()) {
    super();

    this.definition = definition;
  }

  isActive(resource: ProcedureTreeNode | ProcedureFlow): boolean {
    return this.activeInfo?.value === resource;
  }

  active(identityOrState?: ActiveIdentity | ActiveState): void {
    if (typeof identityOrState === 'string') {
      if (!this._activeIdentity) {
        return;
      }

      this._activeIdentity.state = identityOrState;
    } else {
      this._activeIdentity = identityOrState;
    }

    this.emit('update');
  }

  edit(operator: Operator): void {
    this.definition = produce(
      this.definition,
      operator,
      (patches, inversePatches) =>
        this.undoStack.update(patches, inversePatches),
    );
  }

  undo(): void {
    this.definition = this.undoStack.undo(this.definition);
  }

  redo(): void {
    this.definition = this.undoStack.redo(this.definition);
  }
}
