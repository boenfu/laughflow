import {Procedure} from '@magicflow/core';
import {Operator} from '@magicflow/procedure/operators';
import {createEmptyProcedure} from '@magicflow/procedure/utils';
import Eventemitter from 'eventemitter3';
import {produce} from 'immer';

import {Clipboard} from './@clipboard';
import {UndoStack} from './@undo-stack';

type ProcedureEventType = 'update' | 'config';

export class ProcedureEditor extends Eventemitter<ProcedureEventType> {
  readonly undoStack = new UndoStack();

  private clipboard = new Clipboard();

  get procedure(): Procedure {
    return this._procedure;
  }

  set procedure(procedure: Procedure) {
    this._procedure = procedure;
    this.emit('update');
  }

  constructor(private _procedure: Procedure = createEmptyProcedure()) {
    super();
  }

  edit(operator: Operator): void {
    this.procedure = produce(
      this.procedure,
      operator,
      (patches, inversePatches) =>
        this.undoStack.update(patches, inversePatches),
    );
  }

  undo(): void {
    this.procedure = this.undoStack.undo(this.procedure);
  }

  redo(): void {
    this.procedure = this.undoStack.redo(this.procedure);
  }
}
