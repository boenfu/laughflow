import {Procedure, ProcedureModifier, ProcedureUtil} from '../library';

test('procedure class', () => {
  let definition = ProcedureUtil.createEmptyProcedure();
  [definition] = ProcedureModifier.addNode(ProcedureUtil.createNode())(
    definition,
  );

  let procedure = new Procedure(definition);

  expect(procedure).toBeInstanceOf(Procedure);

  expect(procedure.definition.id).toBe(definition.id);
  expect(procedure.flowsMap.size).toBe(1);
  expect(procedure.nodesMap.size).toBe(1);
});
