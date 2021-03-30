import {Flow, FlowId, NodeId} from '@magicflow/core';

import {ProcedureDefinition, createId} from '../../library';

test('create 8 length of nanoid', () => {
  expect(String(createId()).length).toBe(8);
});

test('construct a procedure', () => {
  expect(
    new ProcedureDefinition({
      id: 'procedure1' as FlowId,
      nodes: [],
      joints: [],
    }),
  ).toBeInstanceOf(ProcedureDefinition);
});

test('update definition', async () => {
  let definition: Flow = {
    id: 'procedure1' as FlowId,
    nodes: [],
    joints: [],
  };
  let procedure = new ProcedureDefinition(definition, {
    afterDefinitionChange() {},
  });

  await procedure.update(definition => {
    definition.nodes = [{id: 'node' as NodeId}];
  });

  expect(procedure.definition.nodes.length).toBe(1);
});
