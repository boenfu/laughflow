import {NodeId, ProcedureDefinition, ProcedureId} from '@magicflow/core';

import {Procedure, createId} from '../../library';

test('create 8 length of nanoid', () => {
  expect(String(createId()).length).toBe(8);
});

test('construct a procedure', () => {
  expect(
    new Procedure({
      id: 'procedure1' as ProcedureId,
      nodes: [],
      leaves: [],
    }),
  ).toBeInstanceOf(Procedure);
});

test('update definition', async () => {
  let definition: ProcedureDefinition = {
    id: 'procedure1' as ProcedureId,
    nodes: [],
    leaves: [],
  };
  let procedure = new Procedure(definition, {
    afterDefinitionChange() {},
  });

  await procedure.update(definition => {
    definition.nodes = [{id: 'node' as NodeId}];
  });

  expect(procedure.definition.nodes.length).toBe(1);
});
