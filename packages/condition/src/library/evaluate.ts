import {LogicalOrConditionGroup} from './condition';
import {Operant} from './operant';
import {
  commonOperatorDefinitionDict,
  leftTypeToOperatorNameToRightTypeToOperatorDefinitionMapMapMap,
} from './operator';

export type EvaluateResolver = (variable: string) => any;

export function evaluate(
  orGroup: LogicalOrConditionGroup,
  resolver: EvaluateResolver,
): boolean {
  return orGroup.some(andGroup =>
    andGroup.every(({operator: operatorName, left, right}) => {
      let operatorNameToRightTypeToOperatorDefinitionMapMap = leftTypeToOperatorNameToRightTypeToOperatorDefinitionMapMapMap.get(
        left.type,
      );
      let rightTypeToOperatorDefinitionMap = operatorNameToRightTypeToOperatorDefinitionMapMap?.get(
        operatorName,
      );

      let operatorDefinition =
        rightTypeToOperatorDefinitionMap?.get(right.type) ??
        commonOperatorDefinitionDict[operatorName];

      let {compare} = operatorDefinition;

      return compare(resolve(left), resolve(right));
    }),
  );

  function resolve(operant: Operant): any {
    if ('value' in operant) {
      return operant.value;
    } else {
      return resolver(operant.variable);
    }
  }
}
