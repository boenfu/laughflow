import {castArray} from 'lodash-es';

import type {ProcedureDefinition} from '../core';

export type Operator<TRet = void> = (
  definition: ProcedureDefinition,
) => TRet extends any[] ? [ProcedureDefinition, ...TRet] : ProcedureDefinition;

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
      ProcedureDefinition,
    ];

    return compose(
      castArray(callback(...(args as Parameters<typeof callback>)) || []),
    )(nextDefinition);
  };
}

export type VariableContext<TContext> = {
  out: <TKey extends keyof TContext>(
    operator: Operator<[TContext[TKey]]>,
    key: TKey,
  ) => Operator<any>;
  outs: <TKey extends keyof TContext>(
    operator: Operator<TContext[TKey]>,
    key: TKey,
  ) => Operator<any>;
} & TContext;

/**
 *
 * variables<{nodeA: SingleNode; nodeB: BranchesNode}>([
 *   $ => $.out(addNode(createNode()), 'nodeA'),
 *   $ => $.out(addNode(createBranchesNode()), 'nodeB'),
 *   $ =>
 *     compose([
 *       addNodeNexts($.nodeA.id, [$.nodeB.id]),
 *       addNodeNexts($.nodeB.id, [$.nodeA.id]),
 *     ]),
 * ]);
 *
 * $.out 与 $.outs 无法嵌套在其他 operator 中，
 * 只能处于表达式最外层，否则无法捕获返回值
 * @param expressions
 * @returns
 */
export function variables<TContext>(
  expressions: (($: VariableContext<TContext>) => Operator<any>)[],
): Operator {
  return definition => {
    let outedOperatorMap = new Map<Operator<any>, [string, 'out' | 'outs']>();

    let variable = {
      out(operator: Operator<any>, name: string): Operator<any> {
        outedOperatorMap.set(operator, [name, 'out']);
        return operator;
      },
      outs(operator: Operator<any>, name: string): Operator<any> {
        outedOperatorMap.set(operator, [name, 'outs']);
        return operator;
      },
    } as VariableContext<TContext>;

    for (let expression of expressions) {
      let operator = expression(variable);
      let ret = castArray(operator(definition)) as [
        ProcedureDefinition,
        ...any[],
      ];

      if (outedOperatorMap.has(operator)) {
        let [name, type] = outedOperatorMap.get(operator)!;

        variable[name as keyof TContext] =
          type === 'out' ? ret[1] : ret.slice(1);
        outedOperatorMap.delete(operator);
      }

      definition = ret[0];
    }

    return definition;
  };
}
