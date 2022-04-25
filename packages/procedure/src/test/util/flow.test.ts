import type {FlowId} from '../../library';
import {ProcedureUtil} from '../../library';

test('createFlow params', () => {
  expect(ProcedureUtil.createFlow()).toBeTruthy();
  expect(ProcedureUtil.createFlow({starts: []})).toBeTruthy();
});

test('requireFlow error', () => {
  expect(() =>
    ProcedureUtil.requireFlow(
      ProcedureUtil.createEmptyProcedure(),
      'flow1' as FlowId,
    ),
  ).toThrow(`Not found flow definition by id 'flow1'`);
});
