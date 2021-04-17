import {FlowId, NodeId, ProcedureUtil} from '../../library';

const procedure = ProcedureUtil.createEmptyProcedure();

test('procedure chian', () => {
  let node1 = 'node1' as NodeId;
  let branchesNode1 = 'branchesNode1' as NodeId;
  let flow1 = 'flow1' as FlowId;

  let nextProcedure = ProcedureUtil.chain()
    .addNode(ProcedureUtil.createBranchesNode({id: branchesNode1}))
    .addFlowStart(procedure.start, branchesNode1)
    .addNode(ProcedureUtil.createNode({id: node1}))
    .addFlow(branchesNode1, ProcedureUtil.createFlow({id: flow1}))
    .addFlowStart(flow1, node1)
    .addNodeNexts(node1, [node1])
    .exec(procedure);

  let procedureId = procedure.id;
  let procedureStartId = procedure.start;

  expect(JSON.stringify(nextProcedure)).toBe(
    `{"id":"${procedureId}","start":"${procedureStartId}","flows":[{"id":"${procedureStartId}","starts":["branchesNode1"]},{"id":"flow1","starts":["node1"]}],"nodes":[{"id":"branchesNode1","type":"branchesNode","flows":["flow1"],"nexts":[]},{"id":"node1","type":"singleNode","nexts":["node1"]}]}`,
  );

  nextProcedure = ProcedureUtil.chain()
    .updateFlow({
      ...ProcedureUtil.requireFlow(nextProcedure, flow1),
      outputs: {hello: 'thank you'},
    })
    .updateNode({
      ...ProcedureUtil.requireNode(nextProcedure, node1),
      outputs: {hello: 'thank you'},
    })
    .exec(nextProcedure);

  expect(JSON.stringify(nextProcedure)).toBe(
    `{"id":"${procedureId}","start":"${procedureStartId}","flows":[{"id":"${procedureStartId}","starts":["branchesNode1"]},{"id":"flow1","starts":["node1"],"outputs":{"hello":"thank you"}}],"nodes":[{"id":"branchesNode1","type":"branchesNode","flows":["flow1"],"nexts":[]},{"id":"node1","type":"singleNode","nexts":["node1"],"outputs":{"hello":"thank you"}}]}`,
  );

  nextProcedure = ProcedureUtil.chain()
    .replaceNodeNexts(node1, [branchesNode1])
    .exec(nextProcedure);

  expect(JSON.stringify(nextProcedure)).toBe(
    `{"id":"${procedureId}","start":"${procedureStartId}","flows":[{"id":"${procedureStartId}","starts":["branchesNode1"]},{"id":"flow1","starts":["node1"],"outputs":{"hello":"thank you"}}],"nodes":[{"id":"branchesNode1","type":"branchesNode","flows":["flow1"],"nexts":[]},{"id":"node1","type":"singleNode","nexts":["branchesNode1"],"outputs":{"hello":"thank you"}}]}`,
  );

  nextProcedure = ProcedureUtil.chain()
    .removeNodeNext(node1, branchesNode1)
    .removeNodeNexts(node1)
    .removeNode(node1)
    .removeAllFlowStart(procedureStartId, branchesNode1)
    .removeFlowStart(flow1, node1)
    .removeFlow(branchesNode1, flow1)
    .exec(nextProcedure);

  expect(JSON.stringify(nextProcedure)).toBe(
    `{"id":"${procedureId}","start":"${procedureStartId}","flows":[{"id":"${procedureStartId}","starts":[]}],"nodes":[{"id":"branchesNode1","type":"branchesNode","flows":[],"nexts":[]}]}`,
  );

  nextProcedure = ProcedureUtil.chain().purge().exec(nextProcedure);

  expect(JSON.stringify(nextProcedure)).toBe(
    `{"id":"${procedureId}","start":"${procedureStartId}","flows":[{"id":"${procedureStartId}","starts":[]}],"nodes":[]}`,
  );
});
