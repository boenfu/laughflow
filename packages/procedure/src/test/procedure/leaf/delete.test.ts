import {Flow, FlowId, LeafId, NodeId} from '@magicflow/core';

import {ProcedureDefinition} from '../../../library';

let startId = 'start' as NodeId;
let nodeId = 'node1' as NodeId;
let leafId = 'leaf1' as LeafId;

let definition: Flow = {
  id: 'procedure1' as FlowId,
  metadata: {},
  joints: [],
  nodes: [
    {
      id: startId,
      nexts: [
        {
          type: 'node',
          id: nodeId,
        },
      ],
      leaves: [
        {
          type: 'done',
          id: leafId,
        },
      ],
    },
    {
      id: nodeId,
    },
  ],
};

test('delete leaf', async () => {
  let procedure = new ProcedureDefinition(definition);

  await procedure.deleteLeaf({type: 'node', id: startId}, leafId);

  expect(procedure.definition.nodes[0].leaves?.length).toBe(0);

  expect(procedure.definition.nodes[0].nexts?.length).toBe(1);
});

test('delete non-existent leaf', () => {
  let procedure = new ProcedureDefinition(definition);

  void expect(() =>
    procedure.deleteLeaf({type: 'node', id: startId}, 'fakeLeaf' as LeafId),
  ).rejects.toThrow("Not found leaf metadata by leaf 'fakeLeaf'");
});

test('handle beforeDeleteLeaf', async () => {
  let procedure = new ProcedureDefinition(definition, {
    beforeLeafDelete() {
      return 'handled';
    },
  });

  await procedure.deleteLeaf({type: 'node', id: startId}, leafId);

  expect(procedure.definition.nodes[0].leaves?.length).toBe(1);

  expect(procedure.definition.nodes[0].nexts?.length).toBe(2);
});

test('no-handle beforeDeleteLeaf and delete node nexts', async () => {
  let procedure = new ProcedureDefinition(definition, {
    beforeLeafDelete(_definition, node) {
      node.nexts = undefined;
    },
  });

  await procedure.deleteLeaf({type: 'node', id: startId}, leafId);

  expect(procedure.definition.nodes[0].leaves?.length).toBe(0);

  expect(procedure.definition.nodes[0].nexts).toBeUndefined();
});
