import {Procedure as ProcedureDefinition} from '@magicflow/core';
import {
  Procedure,
  ProcedureFlow,
  ProcedureTreeNode,
  ProcedureUtil,
} from '@magicflow/procedure';
import {Operator} from '@magicflow/procedure/operators';
import {createEmptyProcedure} from '@magicflow/procedure/utils';
import Eventemitter from 'eventemitter3';
import {enableAllPlugins, isDraft, original, produce} from 'immer';
import {merge} from 'lodash-es';

import {UndoStack} from './@undo-stack';

type ProcedureEventType = 'update' | 'config';

enableAllPlugins();

export type ActiveState = 'connect' | 'cut' | 'copy';

export interface ActiveIdentity {
  type: string;
  id: string;
  /**
   * 激活项的前一项
   */
  origin?: string;
  state?: ActiveState;
}

export class ProcedureEditor extends Eventemitter<ProcedureEventType> {
  readonly undoStack = new UndoStack();

  activeIdentity: ActiveIdentity | undefined;

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
    this.emit('update');
  }

  get treeView(): ProcedureFlow {
    return new Procedure(this.definition).treeView;
  }

  constructor(
    private _definition: ProcedureDefinition = createEmptyProcedure(),
  ) {
    super();
  }

  isActive(resource: ProcedureTreeNode | ProcedureFlow): boolean {
    let activeIdentity = this.activeIdentity;

    if (!activeIdentity) {
      return false;
    }

    return (
      resource.type === activeIdentity.type && resource.id === activeIdentity.id
    );
  }

  active(identity?: ActiveIdentity): void {
    this.activeIdentity = identity;
    this.emit('update');
  }

  edit(operator: Operator): void {
    let definition = operator(this.definition);
    definition = isDraft(definition) ? original(definition)! : definition;

    this.definition = produce(
      this.definition,
      originDefinition => merge(originDefinition, definition),
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
