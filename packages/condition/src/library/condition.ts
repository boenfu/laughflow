import {OperatorName, Type} from './operator';

export interface IOperant {
  type: Type;
}

export interface VariableOperant extends IOperant {
  variable: string;
}

export interface ValueOperant<TValue = any> extends IOperant {
  value: TValue;
}

export type Operant = VariableOperant | ValueOperant;

export interface Condition {
  left: Operant;
  right: Operant;
  operator: OperatorName;
}
