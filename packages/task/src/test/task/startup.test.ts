import {
  LeafId,
  NodeId,
  ProcedureDefinition,
  ProcedureId,
} from '@magicflow/core';

import {Task} from '../../library';

let startId = 'start' as NodeId;
let nodeId = 'node1' as NodeId;
let node2Id = 'node2' as NodeId;
let node3Id = 'node3' as NodeId;
let node4Id = 'node4' as NodeId;
let node5Id = 'node5' as NodeId;

let leafId = 'leaf' as LeafId;

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
        {
          type: 'node',
          id: node3Id,
        },
      ],
    },
    {
      id: nodeId,
    },
    {
      id: node2Id,
      leaves: [
        {
          type: 'done',
          id: leafId,
        },
      ],
      nexts: [
        {
          type: 'node',
          id: node4Id,
        },
      ],
    },
    {
      id: node3Id,
      nexts: [
        {
          type: 'node',
          id: node4Id,
        },
      ],
    },
    {
      id: node4Id,
      nexts: [
        {
          type: 'node',
          id: node5Id,
        },
      ],
    },
    {
      id: node5Id,
      nexts: [
        {
          type: 'node',
          id: node5Id,
        },
      ],
    },
  ],
};

test('task startup', () => {
  let task = new Task(definition);

  task.startup(startId);

  expect(task).toBeInstanceOf(Task);
});
