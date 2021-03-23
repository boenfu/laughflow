import {Operant} from './operant';
import {OperatorName} from './operator';

export interface Condition {
  left: Operant;
  right: Operant;
  operator: OperatorName;
}
