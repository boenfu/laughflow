import {
  BranchesNode,
  Node,
  Procedure as ProcedureDefinition,
} from '@magicflow/core';
import {enableAllPlugins, produce} from 'immer';
import {cloneDeep, isEqual} from 'lodash-es';

enableAllPlugins();

export interface ProcedureListeners {
  afterDefinitionChange?(definition: ProcedureDefinition): void;
}

export interface IProcedure {
  definition: ProcedureDefinition;
  listeners: ProcedureListeners;
}

export class Procedure implements IProcedure {
  private _definition!: ProcedureDefinition;

  get definition(): ProcedureDefinition {
    return this._definition;
  }

  constructor(
    definition: ProcedureDefinition,
    readonly listeners: ProcedureListeners = {},
    private readonly stack = new Stack(),
  ) {
    this.setDefinition(cloneDeep(definition), false);
  }

  updateNode(node: Node | BranchesNode): void {
    let nextNodeMetadata = cloneDeep(node);

    this.update(definition => {
      let nodeIndex = definition.nodes.findIndex(({id}) => id === node.id);

      if (nodeIndex === -1) {
        throw Error(`Not found node definition by id '${node.id}'`);
      }

      definition.nodes.splice(nodeIndex, 1, nextNodeMetadata);
    });
  }

  update(handler: (definition: ProcedureDefinition) => void): void {
    let definition = produce(
      this._definition,
      handler,
      (patches, inversePatches) => {
        if (!patches.length) {
          return;
        }

        console.log(patches, inversePatches);

        this.stack.update(patches, inversePatches);
      },
    );

    if (isEqual(definition, this._definition)) {
      return;
    }

    this.setDefinition(definition);
  }

  undo(): void {
    let definition = this.stack.undo(this._definition);

    if (!definition) {
      return;
    }

    this.setDefinition(definition);
  }

  redo(): void {
    let definition = this.stack.redo(this._definition);

    if (!definition) {
      return;
    }

    this.setDefinition(definition);
  }

  private setDefinition(definition: ProcedureDefinition, notify = true): void {
    this._definition = definition;

    if (!notify) {
      return;
    }

    this.listeners.afterDefinitionChange?.(definition);
  }
}
