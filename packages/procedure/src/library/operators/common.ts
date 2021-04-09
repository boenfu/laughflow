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
