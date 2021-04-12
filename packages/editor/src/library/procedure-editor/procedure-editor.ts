import {NodeId, Procedure as ProcedureDefinition} from '@magicflow/core';
import {Procedure, ProcedureFlow, ProcedureUtil} from '@magicflow/procedure';
import {Operator} from '@magicflow/procedure/operators';
import {createEmptyProcedure} from '@magicflow/procedure/utils';
import Eventemitter from 'eventemitter3';
import {enableAllPlugins, isDraft, original, produce} from 'immer';
import {merge} from 'lodash-es';

import {Clipboard} from './@clipboard';
import {UndoStack} from './@undo-stack';

type ProcedureEventType = 'update' | 'config';

enableAllPlugins();

export class ProcedureEditor extends Eventemitter<ProcedureEventType> {
  readonly undoStack = new UndoStack();

  clipboard = new Clipboard<NodeId, NodeId>();

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
