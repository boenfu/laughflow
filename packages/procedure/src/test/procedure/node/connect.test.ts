import {
  LeafId,
  NodeId,
  ProcedureDefinition,
  ProcedureId,
} from '@magicflow/core';

import {Procedure} from '../../../library';

let startId = 'start' as NodeId;
let nodeId = 'node1' as NodeId;

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
      ],
    },
    {
      id: nodeId,
    },
  ],
};

test('connect node', async () => {
  let procedure = new Procedure(definition);

  await procedure.connectNode(nodeId, {type: 'node', id: 'node2' as NodeId});
  await procedure.connectNode(nodeId, {type: 'leaf', id: 'leaf2' as LeafId});

  expect(
    procedure.definition.nodes.find(node => node.id === nodeId)?.nexts?.length,
  ).toBe(2);
});

test('connect node at fakeNode', () => {
  let procedure = new Procedure(definition);

  void expect(() =>
    procedure.connectNode('fakeNode' as NodeId, {type: 'node', id: nodeId}),
  ).rejects.toThrow("Not found node metadata by id 'fakeNode'");
});

test('disconnect node', async () => {
  let procedure = new Procedure(definition);

  await procedure.disconnectNode(startId, {type: 'node', id: nodeId});

  expect(
    procedure.definition.nodes.find(node => node.id === startId)?.nexts?.length,
  ).toBe(0);
});

test('disconnect node at fakeNode', () => {
  let procedure = new Procedure(definition);

  void expect(() =>
    procedure.disconnectNode('fakeNode' as NodeId, {type: 'node', id: nodeId}),
  ).rejects.toThrow("Not found node metadata by id 'fakeNode'");
});
