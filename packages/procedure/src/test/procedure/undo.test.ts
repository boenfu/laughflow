import {NodeId, ProcedureDefinition, ProcedureId} from '@magicflow/core';

import {Procedure} from '../../library';

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

let procedure = new Procedure(definition);

test('undo action', async () => {
  await procedure.createLeaf(nodeId, 'done');

  procedure.undo();
  procedure.undo();

  expect(procedure.definition.leaves.length).toBe(0);
});

test('redo action', async () => {
  procedure.redo();
  procedure.redo();

  expect(procedure.definition.leaves.length).toBe(1);
});
