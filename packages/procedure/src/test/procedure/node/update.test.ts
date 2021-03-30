import {Flow, FlowId, NodeId} from '@magicflow/core';

import {ProcedureDefinition} from '../../../library';

declare global {
  namespace Magicflow {
    interface NodeExtension {
      name?: string;
    }

    interface LeafExtension {
      name?: string;
    }
  }
}

let nodeId = 'node1' as NodeId;

let definition: Flow = {
  id: 'procedure1' as FlowId,
  metadata: {},
  joints: [],
  nodes: [
    {
      id: nodeId,
    },
  ],
};

test('update node', async () => {
  let procedure = new ProcedureDefinition(definition);

  await procedure.updateNode({id: nodeId, name: 'hello'});

  expect(procedure.definition.nodes[0]?.name).toBe('hello');
});

test('update node error params', () => {
  let procedure = new ProcedureDefinition(definition);

  void expect(
    procedure.updateNode({id: 'node2' as NodeId, name: 'hello'}),
  ).rejects.toThrow("Not found node metadata by id 'node2'");
});
