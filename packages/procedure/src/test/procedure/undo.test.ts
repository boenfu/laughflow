import {Flow, FlowId, NodeId} from '@magicflow/core';

import {ProcedureDefinition} from '../../library';

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

let procedure = new ProcedureDefinition(definition);

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
