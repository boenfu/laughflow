import {
  LeafId,
  NodeId,
  ProcedureDefinition,
  ProcedureId,
} from '@magicflow/core';

import {Procedure} from '../../../library';

let startId = 'start' as NodeId;
let nodeId = 'node1' as NodeId;

declare global {
  namespace Magicflow {
    interface ProcedureMetadataExtension {
      name?: string;
    }

    interface NodeMetadataExtension {
      name?: string;
    }

    interface LeafMetadataExtension {
      name?: string;
    }

    interface JointMetadataExtension {
      name?: string;
    }
  }
}

let definition: ProcedureDefinition = {
  id: 'procedure1' as ProcedureId,
  metadata: {},
  leaves: [],
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

test('create leaf', async () => {
  let procedure = new Procedure(definition);

  await procedure.createLeaf(
    {
      type: 'node',
      id: nodeId,
    },
    'done',
  );

  expect(procedure.getNode(nodeId)?.nexts?.length).toBe(1);

  expect(
    procedure.getLeaf(procedure.getNode(nodeId)?.nexts?.[0].id as LeafId),
  ).toBeTruthy();
});

test('create leaf at fakeNode', () => {
  let procedure = new Procedure(definition);

  void expect(() =>
    procedure.createLeaf(
      {
        type: 'node',
        id: 'fakeNode' as NodeId,
      },
      'done',
    ),
  ).rejects.toThrow("Not found node metadata by id 'fakeNode'");
});

test('no-handle beforeCreateLeaf & update metadata', async () => {
  let procedure = new Procedure(definition, {
    beforeLeafCreate(leaf, node, definition) {
      definition.nodes.push({
        id: 'extraNodeId' as NodeId,
        name: 'extraNodeName',
      });

      node.name = 'nodeName';
      leaf.name = 'leafName';
    },
  });

  await procedure.createLeaf(
    {
      type: 'node',
      id: nodeId,
    },
    'done',
  );

  expect(procedure.definition.leaves[0].name).toBe('leafName');

  expect(procedure.getNode(nodeId)?.name).toBe('nodeName');

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

  await procedure.createLeaf(
    {
      type: 'node',
      id: nodeId,
    },
    'done',
  );

  expect(procedure.definition.leaves?.length).toBeFalsy();

  expect(procedure.getNode(nodeId)?.nexts?.length).toBeFalsy();
});
