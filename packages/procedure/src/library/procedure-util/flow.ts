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
  id: _id,
  nodes = [],
  ...partial
}: Partial<Flow> = {}): Flow {
  return {
    id: createId(),
    nodes,
    ...partial,
  };
}
