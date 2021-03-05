import {
  LeafId,
  NodeId,
  ProcedureDefinition,
  ProcedureId,
} from '@magicflow/core';
import {cloneDeep} from 'lodash-es';

import {Procedure} from '../../../library';

let startId = 'start' as NodeId;
let nodeId = 'node1' as NodeId;
let leafId = 'leaf1' as LeafId;

let definition: ProcedureDefinition = {
  id: 'procedure1' as ProcedureId,
  metadata: {},
  leaves: [
    {
      type: 'done',
      id: leafId,
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
          type: 'leaf',
          id: leafId,
        },
      ],
    },
    {
      id: nodeId,
    },
  ],
};

test('delete leaf', async () => {
  let procedure = new Procedure(definition);

  await procedure.deleteLeaf(leafId);

  expect(procedure.definition.leaves.length).toBe(0);

  expect(procedure.definition.nodes[0].nexts?.length).toBe(1);
});

test('delete non-used leaf', async () => {
  let clonedDefinition = cloneDeep(definition);
  clonedDefinition.nodes[0].nexts = clonedDefinition.nodes[0].nexts?.filter(
    next => next.type !== 'leaf',
  );

  let procedure = new Procedure(clonedDefinition);

  await procedure.deleteLeaf(leafId);
  expect(procedure.definition.leaves.length).toBe(0);
});

test('delete non-existent leaf', () => {
  let procedure = new Procedure(definition);

  void expect(() => procedure.deleteLeaf('fakeLeaf' as LeafId)).rejects.toThrow(
    "Not found leaf metadata by leaf 'fakeLeaf'",
  );
});

test('handle beforeDeleteLeaf', async () => {
  let procedure = new Procedure(definition, {
    beforeLeafDelete() {
      return 'handled';
    },
  });

  await procedure.deleteLeaf(leafId);

  expect(procedure.definition.leaves?.length).toBe(1);

  expect(procedure.definition.nodes[0].nexts?.length).toBe(2);
});

test('no-handle beforeDeleteLeaf and delete node nexts', async () => {
  let procedure = new Procedure(definition, {
    beforeLeafDelete(_definition, node) {
      node.nexts = undefined;
    },
  });

  await procedure.deleteLeaf(leafId);

  expect(procedure.definition.leaves?.length).toBe(0);

  expect(procedure.definition.nodes[0].nexts).toBeUndefined();
});
