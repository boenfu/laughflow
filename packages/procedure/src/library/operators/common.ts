import {Procedure} from '@magicflow/core';
import {castArray} from 'lodash-es';

export type Operator<TRet = void> = (
  definition: Procedure,
) => TRet extends any[] ? [Procedure, ...TRet] : Procedure;

export type OperatorFunction<TParams extends any[], TRet = void> = (
  ...args: TParams
) => Operator<TRet>;

export function compose(operators: Operator<any>[]): Operator {
  return definition => {
    for (let operator of operators) {
      definition = castArray(operator(definition))[0];
    }

    return definition;
  };
}

export function out<TRet>(
  operator: Operator<TRet>,
  callback: (
    ...args: TRet extends any[] ? TRet : []
  ) => Operator<any> | Operator<any>[] | void,
): Operator {
  return definition => {
    let [nextDefinition, ...args] = castArray(operator(definition)) as [
      Procedure,
    ];

    return compose(
      castArray(callback(...(args as Parameters<typeof callback>)) || []),
    )(nextDefinition);
  };
}

type VariableContext = {
  [TKey in string]: any;
} & {
  out: (operator: Operator<any>) => Operator<any>;
  outs: (operator: Operator<any>) => Operator<any>;
};

/**
 *
 * variables(({out, $0}) => [
 *  out(addNode(createNode())),
 *  addNodeNexts($0.id, []),
 *  addNodeNexts($0.id, []),
 * ]);
 *
 * @param callback
 * @returns
 */
export function variables(
  callback: ($: VariableContext) => Operator<any>[],
): Operator {
  return definition => {
    let operatorIndexMap = new Map<
      Operator<any>,
      [number, keyof VariableContext]
    >();

    let index = 0;
    let variable: VariableContext = {
      out(operator: Operator<any>): Operator<any> {
        operatorIndexMap.set(operator, [index, 'out']);
        index += 1;
        return operator;
      },
      outs(operator: Operator<any>): Operator<any> {
        operatorIndexMap.set(operator, [index, 'outs']);
        index += 1;
        return operator;
      },
    };

    for (let operator of callback(variable)) {
      let ret = castArray(operator(definition)) as [Procedure, ...any[]];

      if (operatorIndexMap.has(operator)) {
        let [index, type] = operatorIndexMap.get(operator)!;
        variable[`$${index}`] = type === 'out' ? ret[1] : ret.slice(1);
        operatorIndexMap.delete(operator);
      }

      definition = ret[0];
    }

    return definition;
  };
}
