import {NodeId, ProcedureDefinition, ProcedureId} from '@magicflow/core';

import {Procedure} from '../../library';

let startId = 'start' as NodeId;
let nodeId = 'node1' as NodeId;

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
      ],
    },
    {
      id: nodeId,
    },
  ],
};

let procedure = new Procedure(definition);

test('undo action', async () => {
  await procedure.createLeaf(
    {
      type: 'node',
      id: nodeId,
    },
    'done',
  );

  procedure.undo();

  // test branch
  procedure.undo();

  expect(procedure.getNode(nodeId)?.leaves?.length).toBe(0);
});

test('redo action', async () => {
  procedure.redo();

  // test branch
  procedure.redo();

  expect(procedure.getNode(nodeId)?.leaves?.length).toBe(1);
});
