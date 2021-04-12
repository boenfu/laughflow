import {Flow, FlowId, Procedure} from '@magicflow/core';

import {createId} from './common';

export function requireFlow(definition: Procedure, flowId: FlowId): Flow {
  let flow = definition.flows.find(flow => flow.id === flowId);

  if (!flow) {
    throw Error(`Not found flow definition by id '${flowId}'`);
  }

  return flow;
}

export function createFlow({
  id = createId()!,
  starts = [],
  ...partial
}: Partial<Flow> = {}): Flow {
  return {
    id,
    starts,
    ...partial,
  };
}
