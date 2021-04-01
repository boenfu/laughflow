import {LeafId} from '@magicflow/core';

import {ProcedureUtil} from '../../library';

test('requireLeaf error', () => {
  expect(() =>
    ProcedureUtil.requireLeaf(ProcedureUtil.createNode(), 'leaf1' as LeafId),
  ).toThrow(`Not found leaf definition by id 'leaf1'`);
});
