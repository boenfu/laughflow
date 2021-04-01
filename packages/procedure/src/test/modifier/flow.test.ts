import {ProcedureModifier, ProcedureUtil} from '../../library';

const procedure = ProcedureUtil.createEmptyProcedure();

test('replaceNodeLeaves', () => {
  let node = ProcedureUtil.createNode();
  let newProcedure = ProcedureModifier.addNode(procedure, node);
  node.outputs = {hello: 'thank you'};

  expect(
    ProcedureModifier.updateNode(newProcedure, node).nodes[0].outputs?.[
      'hello'
    ],
  ).toBe('thank you');
});
