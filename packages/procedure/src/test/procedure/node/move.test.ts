import {
  LeafId,
  NodeId,
  ProcedureDefinition,
  ProcedureId,
} from '@magicflow/core';

import {Procedure} from '../../../library';

let startId = 'start' as NodeId;
let nodeId = 'node1' as NodeId;
let node2Id = 'node2' as NodeId;
let node3Id = 'node3' as NodeId;
let node4Id = 'node4' as NodeId;
let leafId = 'leaf' as LeafId;

let definition: ProcedureDefinition = {
  id: 'procedure1' as ProcedureId,
  metadata: {},
  leaves: [],
  nodes: [
    {
      id: startId,
      nexts: [
        {
          type: 'node',
          id: nodeId,
        },
        {
          type: 'node',
          id: node2Id,
        },
        {
          type: 'node',
          id: node3Id,
        },
      ],
    },
    {
      id: nodeId,
    },
    {
      id: node2Id,
      nexts: [
        {
          type: 'leaf',
          id: leafId,
        },
        {
          type: 'node',
          id: node4Id,
        },
      ],
    },
    {
      id: node3Id,
      nexts: [
        {
          type: 'node',
          id: node4Id,
        },
      ],
    },
    {
      id: node4Id,
    },
  ],
};

test('move node', async () => {
  let procedure = new Procedure(definition);

  await procedure.moveNode(node2Id, startId, node3Id, undefined);

  expect(procedure.getNode(startId)?.nexts?.length).toBe(3);
  expect(procedure.getNode(node3Id)?.nexts?.length).toBe(2);
});

test('move node to self', async () => {
  let procedure = new Procedure(definition);

  await procedure.moveNode(node2Id, startId, node2Id, undefined);

  expect(procedure.getNode(startId)?.nexts?.length).toBe(3);
});

test('move node to between two nodes', async () => {
  let procedure = new Procedure(definition);

  await procedure.moveNode(node2Id, startId, node3Id, {
    type: 'node',
    id: node4Id,
  });

  expect(procedure.getNode(startId)?.nexts?.length).toBe(3);
  expect(procedure.getNode(node3Id)?.nexts?.length).toBe(1);
  expect(procedure.getNode(node2Id)?.nexts?.length).toBe(2);
});

test('move node error params', () => {
  let procedure = new Procedure(definition);

  void expect(
    procedure.moveNode('fakeNode' as NodeId, startId, nodeId, undefined),
  ).rejects.toThrow("Not found movingNode metadata by id 'fakeNode'");

  void expect(
    procedure.moveNode(node2Id, startId, 'fakeNode' as NodeId, undefined),
  ).rejects.toThrow("Not found targetNode metadata by id 'fakeNode'");

  void expect(
    procedure.moveNode(node4Id, startId, node3Id, undefined),
  ).rejects.toThrow(
    "Not found movingNode 'node4' at nexts of originNode 'start'",
  );

  void expect(
    procedure.moveNode(node4Id, startId, nodeId, undefined),
  ).rejects.toThrow(
    "Not found movingNode 'node4' at nexts of originNode 'start'",
  );

  void expect(
    procedure.moveNode(node2Id, nodeId, node4Id, undefined),
  ).rejects.toThrow(
    "Not found movingNode 'node2' at nexts of originNode 'node1'",
  );

  void expect(
    procedure.moveNode(node3Id, undefined, nodeId, {
      type: 'node',
      id: node4Id,
    }),
  ).rejects.toThrow(
    'Not found targetNext {"type":"node","id":"node4"} at nexts of targetNode \'node1\'',
  );
});
