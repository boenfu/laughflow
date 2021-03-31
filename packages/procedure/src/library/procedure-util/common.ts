import {Flow, Procedure} from '@magicflow/core';
import {nanoid} from 'nanoid';

export function createId<TId>(): TId {
  return (nanoid(8) as unknown) as TId;
}

export function createEmptyProcedure(): Procedure {
  let flow: Flow = {id: createId(), nodes: []};

  return {
    id: createId(),
    start: flow.id,
    flows: [flow],
    nodes: [],
  };
}
