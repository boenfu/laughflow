import {Flow, FlowId, NodeId} from '@magicflow/core';

import {ProcedureDefinition} from '../../../library';

let startId = 'start' as NodeId;
let nodeId = 'node1' as NodeId;

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
    },
    {
      id: nodeId,
    },
  ],
};

test('connect node', async () => {
  let procedure = new ProcedureDefinition(definition);

  await procedure.connectNode(
    {
      type: 'node',
      id: nodeId,
    },
    {
      type: 'node',
      id: 'node2' as NodeId,
    },
  );

  expect(procedure.getNode(nodeId)?.nexts?.length).toBe(2);
});

test('connect node at fakeNode', () => {
  let procedure = new ProcedureDefinition(definition);

  void expect(() =>
    procedure.connectNode(
      {
        type: 'node',
        id: 'fakeNode' as NodeId,
      },
      {
        type: 'node',
        id: nodeId,
      },
    ),
  ).rejects.toThrow("Not found node metadata by id 'fakeNode'");
});

test('disconnect node', async () => {
  let procedure = new ProcedureDefinition(definition);

  await procedure.disconnectNode(
    {
      type: 'node',
      id: startId,
    },
    {
      type: 'node',
      id: nodeId,
    },
  );

  expect(procedure.getNode(startId)?.nexts?.length).toBe(0);
});

test('disconnect node at no-nexts node', async () => {
  let procedure = new ProcedureDefinition(definition);

  await procedure.disconnectNode(
    {
      type: 'node',
      id: nodeId,
    },
    {
      type: 'node',
      id: nodeId,
    },
  );

  expect(procedure.getNode(nodeId)?.nexts).toBeFalsy();
});

test('disconnect node at fakeNode', () => {
  let procedure = new ProcedureDefinition(definition);

  void expect(() =>
    procedure.disconnectNode(
      {
        type: 'node',
        id: 'fakeNode' as NodeId,
      },
      {
        type: 'node',
        id: nodeId,
      },
    ),
  ).rejects.toThrow("Not found node metadata by id 'fakeNode'");
});
