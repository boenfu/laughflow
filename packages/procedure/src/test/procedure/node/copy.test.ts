import {
  NodeId,
  NodeRef,
  ProcedureDefinition,
  ProcedureId,
} from '@magicflow/core';
import {cloneDeep, unionBy} from 'lodash-es';

import {Procedure} from '../../../library';

declare module '@magicflow/core' {
  interface NodeMetadata {
    name?: string;
  }

  interface LeafMetadata {
    name?: string;
  }
}

let startId = 'start' as NodeId;
let nodeId = 'node1' as NodeId;
let node2Id = 'node2' as NodeId;

let definition: ProcedureDefinition = {
  id: 'procedure1' as ProcedureId,
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
        {
          type: 'node',
          id: node2Id,
        },
      ],
    },
    {
      id: nodeId,
      name: 'hello',
    },
    {
      id: node2Id,
    },
  ],
};

test('copy node', async () => {
  let procedure = new Procedure(definition);

  await procedure.copyNode(
    nodeId,
    {
      type: 'node',
      id: startId,
    },
    undefined,
  );

  // check node nexts
  expect(procedure.getNode(startId)?.nexts?.length).toBe(3);

  // check node definition length
  expect(unionBy(procedure.definition.nodes, 'id').length).toBe(4);

  // check duplicatedNode content
  expect(
    procedure.definition.nodes.reduce(
      (times, node) => (times += Number(node.name === 'hello')),
      0,
    ),
  ).toBe(2);
});

test('copy node to between two nodes', async () => {
  let clonedDefinition = cloneDeep(definition);
  let node3Id = 'node3' as NodeId;
  let node3Next: NodeRef = {
    type: 'node',
    id: node3Id,
  };

  clonedDefinition.nodes.push({id: node3Id});
  clonedDefinition.nodes.find(node => node.id === node2Id)!.nexts = [node3Next];

  let procedure = new Procedure(clonedDefinition);

  await procedure.copyNode(
    nodeId,
    {
      type: 'node',
      id: node2Id,
    },
    node3Next,
  );

  let node2 = procedure.getNode(node2Id);

  expect(node2?.nexts?.length).toBe(1);

  expect(node2?.nexts?.[0].id).not.toBe(node3Id);

  let clonedNode = procedure.getNode(node2?.nexts?.[0].id as NodeId);

  expect(clonedNode?.nexts?.[0].id).toBe(node3Id);

  expect(clonedNode?.name === 'hello').toBeTruthy();
});

test('copy node error params', async () => {
  let procedure = new Procedure(definition);

  await procedure.copyNode(
    nodeId,
    {
      type: 'node',
      id: startId,
    },
    undefined,
  );

  void expect(
    procedure.copyNode(
      'fakeNode' as NodeId,
      {
        type: 'node',
        id: startId,
      },
      undefined,
    ),
  ).rejects.toThrow("Not found node metadata by id 'fakeNode'");

  void expect(
    procedure.copyNode(
      nodeId,
      {
        type: 'node',
        id: 'fakeTargetNode' as NodeId,
      },
      undefined,
    ),
  ).rejects.toThrow("Not found node metadata by id 'fakeTargetNode'");

  // void expect(
  //   procedure.copyNode(
  //     nodeId,
  //     {
  //       type: 'node',
  //       id: startId,
  //     },
  //     {
  //       type: 'leaf',
  //       id: 'fakeTargetNext' as LeafId,
  //     },
  //   ),
  // ).rejects.toThrow(
  //   'Not found next metadata {"type":"leaf","id":"fakeTargetNext"} at node \'start\'',
  // );

  // void expect(
  //   procedure.copyNode(
  //     nodeId,
  //     {
  //       type: 'node',
  //       id: node2Id,
  //     },
  //     {
  //       type: 'leaf',
  //       id: 'fakeTargetNext' as LeafId,
  //     },
  //   ),
  // ).rejects.toThrow(
  //   'Not found next metadata {"type":"leaf","id":"fakeTargetNext"} at node \'node2\'',
  // );
});
