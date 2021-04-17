import {castArray} from 'lodash-es';
import {nanoid} from 'nanoid';

import {Flow, ProcedureDefinition} from '../core';
import {ProcedureOperator} from '../operators';

export function createId<TId>(): TId {
  return (nanoid(8) as unknown) as TId;
}

export function createEmptyProcedure(): ProcedureDefinition {
  let flow: Flow = {
    id: createId(),
    starts: [],
  };

  return {
    id: createId(),
    start: flow.id,
    flows: [flow],
    nodes: [],
  };
}

export type ProcedureChain = {
  [TKey in keyof typeof ProcedureOperator]: (
    ...args: Parameters<typeof ProcedureOperator[TKey]>
  ) => ProcedureChain;
} & {
  exec(definition: ProcedureDefinition): ProcedureDefinition;
};

export function chain(): ProcedureChain {
  type ProcedureChainInternal = {
    _fns: [string | symbol, any[]][];
  } & ProcedureChain;

  return new Proxy<ProcedureChainInternal>(
    ({
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

        return (definition: ProcedureDefinition) => {
          for (let [fnName, params] of target._fns) {
            let fn = ((ProcedureOperator as unknown) as {
              [key in string]: (...args: any[]) => any;
            })[String(fnName)];

            definition = castArray(fn(...params)(definition))[0];
          }

          return definition;
        };
      },
    },
  );
}

export const cloneDeep = <TData>(data: TData): TData =>
  JSON.parse(JSON.stringify(data));
