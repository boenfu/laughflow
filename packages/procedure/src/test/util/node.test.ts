import {NodeId} from '@magicflow/procedure';

import {ProcedureOperator, ProcedureUtil} from '../../library';

test('copy params', () => {
  expect(ProcedureUtil.copyNode(ProcedureUtil.createNode())).toBeTruthy();
  expect(
    ProcedureUtil.copyNode({
      ...ProcedureUtil.createNode(),
    }),
  ).toBeTruthy();
});

test('createBranchesNode params', () => {
  expect(ProcedureUtil.createBranchesNode()).toBeTruthy();
  expect(ProcedureUtil.createBranchesNode({nexts: []})).toBeTruthy();
});

test('requireNode error', () => {
  let node1 = 'node1' as NodeId;

  expect(() =>
    ProcedureUtil.requireNode(ProcedureUtil.createEmptyProcedure(), node1),
  ).toThrow(`Not found node definition by id 'node1'`);

  expect(() =>
    ProcedureUtil.requireNode(
      ProcedureOperator.addNode(ProcedureUtil.createBranchesNode({id: node1}))(
        ProcedureUtil.createEmptyProcedure(),
      )[0],
      node1,
      'singleNode',
    ),
  ).toThrow(`Not found singleNode definition by id 'node1'`);
});
