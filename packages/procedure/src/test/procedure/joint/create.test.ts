import {
  JointId,
  NodeId,
  ProcedureDefinition,
  ProcedureId,
} from '@magicflow/core';

import {Procedure} from '../../../library';

let startId = 'start' as NodeId;
let nodeId = 'node1' as NodeId;

let definition: ProcedureDefinition<{}> = {
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

test('create joint', async () => {
  let procedure = new Procedure(definition);

  await procedure.createJoint(
    {
      type: 'node',
      id: nodeId,
    },
    {
      type: 'node',
      id: nodeId,
    },
  );

  expect(procedure.getNode(nodeId)?.nexts?.length).toBe(1);

  expect(
    procedure.getJoint(procedure.getNode(nodeId)?.nexts?.[0].id as JointId),
  ).toBeTruthy();
});

test('create joint with next', async () => {
  let procedure = new Procedure(definition);

  await procedure.createJoint(
    {
      type: 'node',
      id: startId,
    },
    {
      type: 'node',
      id: nodeId,
    },
  );

  expect(procedure.getNode(startId)?.nexts?.length).toBe(1);

  expect(
    procedure.getJoint(procedure.getNode(startId)?.nexts?.[0].id as JointId)
      ?.nexts?.[0].id,
  ).toBe(nodeId);
});

test('create joint error params', () => {
  let procedure = new Procedure(definition);

  void expect(
    procedure.createJoint(
      {
        type: 'node',
        id: startId,
      },
      {
        type: 'node',
        id: 'fakeNode' as NodeId,
      },
    ),
  ).rejects.toThrow(
    'Not found next metadata {"type":"node","id":"fakeNode"} at node \'start\'',
  );
});
