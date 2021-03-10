import {
  LeafId,
  NodeId,
  ProcedureDefinition,
  ProcedureId,
} from '@magicflow/core';
import {cloneDeep} from 'lodash-es';

import {Procedure} from '../../../library';

let startId = 'start' as NodeId;
let nodeId = 'node1' as NodeId;
let node2Id = 'node2' as NodeId;
let node3Id = 'node3' as NodeId;
let node4Id = 'node4' as NodeId;

let leaf = 'leaf' as LeafId;

let definition: ProcedureDefinition = {
  id: 'procedure1' as ProcedureId,
  metadata: {},
  joints: [],
  leaves: [
    {
      type: 'done',
      id: leaf,
    },
  ],
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
      ],
    },
    {
      id: nodeId,
      nexts: [
        {
          type: 'node',
          id: node3Id,
        },
      ],
    },
    {
      id: node2Id,
      nexts: [
        {
          type: 'node',
          id: node3Id,
        },
        {
          type: 'leaf',
          id: leaf,
        },
      ],
    },
    {
      id: node3Id,
    },
    {
      id: node4Id,
    },
  ],
};

test('delete node', async () => {
  let procedure = new Procedure(definition);

  await procedure.deleteNode(nodeId, undefined);

  expect(procedure.definition.nodes.length).toBe(4);
  expect(procedure.definition.nodes[0].nexts?.length).toBe(1);
});

test('delete node with prevNode', async () => {
  let procedure = new Procedure(definition);

  await procedure.deleteNode(nodeId, {type: 'node', id: startId});

  expect(procedure.definition.nodes.length).toBe(4);
  expect(procedure.definition.nodes[0].nexts?.length).toBe(2);
});

test('delete node error params', async () => {
  let procedure = new Procedure(definition);

  void expect(
    procedure.deleteNode(nodeId, {type: 'node', id: nodeId}),
  ).rejects.toThrow("Not found node 'node1' at nexts of prevNode 'node1'");

  void expect(
    procedure.deleteNode(nodeId, {type: 'node', id: node3Id}),
  ).rejects.toThrow("Not found node 'node1' at nexts of prevNode 'node3'");

  void expect(
    procedure.deleteNode(nodeId, {type: 'node', id: 'fakeNode' as NodeId}),
  ).rejects.toThrow("Not found node metadata by id 'fakeNode'");

  void expect(
    procedure.deleteNode('fakeNode' as NodeId, {type: 'node', id: startId}),
  ).rejects.toThrow("Not found node metadata by id 'fakeNode'");

  let clonedDefinition = cloneDeep(definition);
  clonedDefinition.nodes.find(node => node.id === node3Id)!.nexts = [
    {type: 'node', id: startId},
  ];
  let procedureWithCycle = new Procedure(clonedDefinition);

  void expect(
    procedureWithCycle.deleteNode(nodeId, {type: 'node', id: startId}),
  ).rejects.toThrow(
    "Delete node 'node1' failed because delete path with cycle",
  );

  let clonedDefinition2 = cloneDeep(definition);
  clonedDefinition2.nodes.find(node => node.id === node3Id)!.nexts = [
    {type: 'node', id: 'fakeNode' as NodeId},
  ];
  let procedureWithFakeNext = new Procedure(clonedDefinition2);

  void expect(
    procedureWithFakeNext.deleteNode(nodeId, {type: 'node', id: startId}),
  ).rejects.toThrow("Not found node metadata by id 'fakeNode'");

  let clonedDefinition3 = cloneDeep(definition);
  clonedDefinition3.nodes
    .find(node => node.id === nodeId)!
    .nexts?.push({type: 'node', id: node3Id});

  clonedDefinition3.nodes.find(node => node.id === node3Id)!.nexts = [
    {type: 'leaf', id: leaf},
    {type: 'node', id: node4Id},
  ];

  let procedureWithVisited = new Procedure(clonedDefinition3);

  void expect(
    procedureWithVisited.deleteNode(nodeId, {type: 'node', id: startId}),
  ).resolves;
  void expect(
    procedureWithVisited.deleteNode(node4Id, {type: 'node', id: node3Id}),
  ).resolves;
  void expect(
    procedureWithVisited.deleteNode(node3Id, {type: 'node', id: node2Id}),
  ).resolves;
});
