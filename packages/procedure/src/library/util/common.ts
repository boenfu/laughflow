import {Flow, Procedure} from '@magicflow/core';
import {castArray} from 'lodash-es';
import {nanoid} from 'nanoid';

import {ProcedureModifier} from '../modifier';

export function createId<TId>(): TId {
  return (nanoid(8) as unknown) as TId;
}

export function createEmptyProcedure(): Procedure {
  let flow: Flow = {
    id: createId(),
    nodes: [],
  };

  return {
    id: createId(),
    start: flow.id,
    flows: [flow],
    nodes: [],
  };
}

export type ProcedureChain = {
  [TKey in keyof typeof ProcedureModifier]: (
    ...args: Parameters<typeof ProcedureModifier[TKey]> extends [
      any,
      ...infer TParameters
    ]
      ? TParameters
      : never
  ) => ProcedureChain;
} & {
  exec(): Procedure;
};

export function chain(definition: Procedure): ProcedureChain {
  type ProcedureChainInternal = {
    _definition: Procedure;
    _fns: [string | symbol, any[]][];
  } & ProcedureChain;

  return new Proxy<ProcedureChainInternal>(
    ({
      _definition: definition,
      _fns: [],
    } as unknown) as ProcedureChainInternal,
    {
      get(target, key, proxy) {
        if (key !== 'exec') {
          return (...args: any[]) => {
            target._fns.push([key, args]);
            return proxy;
          };
        }

        return () => {
          let definition = target._definition;

          for (let [fnName, params] of target._fns) {
            let fn = ((ProcedureModifier as unknown) as {
              [key in string]: (...args: any[]) => any;
            })[String(fnName)];

            definition = castArray(fn(definition, ...params))[0];
          }

          return definition;
        };
      },
    },
  );
}
