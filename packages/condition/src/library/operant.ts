import {Type} from './operator';

export interface IOperant {
  type: Type;
}

export interface VariableOperant extends IOperant {
  variable: string;
}

export interface ValueOperant extends IOperant {
  value: unknown;
}

export type Operant = VariableOperant | ValueOperant;
