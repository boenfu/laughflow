import {Procedure as ProcedureDefinition} from '@magicflow/core';
import {cloneDeep} from 'lodash-es';

export interface IProcedure {
  definition: ProcedureDefinition;
}

export class Procedure implements IProcedure {
  private _definition!: ProcedureDefinition;

  get definition(): ProcedureDefinition {
    return this._definition;
  }

  constructor(definition: ProcedureDefinition) {
    this.setDefinition(cloneDeep(definition));
  }

  private setDefinition(definition: ProcedureDefinition): void {
    this._definition = definition;
  }
}
