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
let jointId = 'joint1' as JointId;

let definition: ProcedureDefinition = {
  id: 'procedure1' as ProcedureId,
  metadata: {},
  joints: [
    {
      id: jointId,
      master: nodeId,
    },
  ],
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
    },
  ],
};

test('connect joint', async () => {
  let procedure = new Procedure(definition);

  await procedure.connectJoint(node2Id, jointId);

  expect(procedure.getNode(node2Id)?.nexts?.[0].id).toBe(jointId);
});

test('connect joint error params', () => {
  let procedure = new Procedure(definition);

  void expect(
    procedure.connectJoint(node2Id, 'fakeJoint' as JointId),
  ).rejects.toThrow("Not found joint metadata by id 'fakeJoint'");
});
