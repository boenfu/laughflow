import {Flow, FlowId, JointId, NodeId} from '@magicflow/core';

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

test('create joint', async () => {
  let procedure = new ProcedureDefinition(definition);

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
  let procedure = new ProcedureDefinition(definition);

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
  let procedure = new ProcedureDefinition(definition);

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
