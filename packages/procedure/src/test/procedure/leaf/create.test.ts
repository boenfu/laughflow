import {NodeId, ProcedureDefinition, ProcedureId} from '@magicflow/core';

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

test('create leaf', async () => {
  let procedure = new Procedure(definition);

  await procedure.createLeaf(nodeId, 'done');

  expect(procedure.definition.leaves.length).toBe(1);

  expect(
    procedure.definition.nodes.find(node => node.id === nodeId)?.nexts?.length,
  ).toBe(1);
});

test('create leaf at fakeNode', () => {
  let procedure = new Procedure(definition);

  void expect(() =>
    procedure.createLeaf('fakeNode' as NodeId, 'done'),
  ).rejects.toThrow("Not found node metadata by id 'fakeNode'");
});

declare module '@magicflow/core' {
  interface NodeMetadata {
    name?: string;
  }

  interface LeafMetadata {
    name?: string;
  }
}

test('no-handle beforeCreateLeaf & update metadata', async () => {
  let procedure = new Procedure(definition, {
    beforeLeafCreate(definition, node, leaf) {
      definition.nodes.push({
        id: 'extraNodeId' as NodeId,
        name: 'extraNodeName',
      });
      node.name = 'nodeName';
      leaf.name = 'leafName';
    },
  });

  await procedure.createLeaf(nodeId, 'done');

  expect(procedure.definition.leaves[0].name).toBe('leafName');

  expect(
    procedure.definition.nodes.find(node => node.id === nodeId)?.name,
  ).toBe('nodeName');

  expect(
    procedure.definition.nodes.find(node => node.name === 'extraNodeName'),
  ).toBeTruthy();
});

test('handle beforeCreateLeaf', async () => {
  let procedure = new Procedure(definition, {
    beforeLeafCreate() {
      return 'handled';
    },
  });

  await procedure.createLeaf(nodeId, 'done');

  expect(procedure.definition.leaves?.length).toBeFalsy();

  expect(
    procedure.definition.nodes.find(node => node.id === nodeId)?.nexts?.length,
  ).toBeFalsy();
});
