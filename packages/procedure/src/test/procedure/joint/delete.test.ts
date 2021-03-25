import {
  JointId,
  NodeId,
  ProcedureDefinition,
  ProcedureId,
} from '@magicflow/core';

import {Procedure} from '../../../library';

let startId = 'start' as NodeId;
let nodeId = 'node1' as NodeId;
let node2Id = 'node2' as NodeId;
let node3Id = 'node3' as NodeId;
let jointId = 'joint1' as JointId;

let definition: ProcedureDefinition = {
  id: 'procedure1' as ProcedureId,
  metadata: {},
  joints: [
    {
      id: jointId,
      master: {
        type: 'node',
        id: nodeId,
      },
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
          type: 'joint',
          id: jointId,
        },
      ],
    },
    {
      id: node2Id,
      nexts: [
        {
          type: 'joint',
          id: jointId,
        },
      ],
    },
  ],
};

test('delete joint', async () => {
  let procedure = new Procedure(definition);

  await procedure.deleteJoint(jointId);

  expect(procedure.definition.joints.length).toBe(0);

  expect(procedure.getNode(nodeId)?.nexts?.length).toBeFalsy();
  expect(procedure.getNode(node2Id)?.nexts?.length).toBeFalsy();
});

test('delete joint have nexts', async () => {
  definition.joints[0].nexts = [
    {
      type: 'node',
      id: node3Id,
    },
  ];

  let procedure = new Procedure(definition);

  await procedure.deleteJoint(jointId);

  expect(procedure.definition.joints.length).toBe(0);

  expect(procedure.getNode(nodeId)?.nexts?.[0].id).toBe(node3Id);
  expect(procedure.getNode(node2Id)?.nexts?.length).toBeFalsy();
});

test('delete joint error params', () => {
  let procedure = new Procedure(definition);

  void expect(procedure.deleteJoint('fakeJoint' as JointId)).rejects.toThrow(
    "Not found joint metadata by id 'fakeJoint'",
  );
});
