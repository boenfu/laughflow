import {FlowId, LeafId, NodeId} from '@magicflow/core';

import {ProcedureUtil} from '../../library';

const procedure = ProcedureUtil.createEmptyProcedure();

test('procedure chian', () => {
  let node1 = 'node1' as NodeId;
  let branchesNode1 = 'branchesNode1' as NodeId;
  let flow1 = 'flow1' as FlowId;
  let leaf1 = 'leaf1' as LeafId;

  let nextProcedure = ProcedureUtil.chain(procedure)
    .addNode(ProcedureUtil.createBranchesNode({id: branchesNode1}))
    .addFlowStart(procedure.start, branchesNode1)
    .addNode(ProcedureUtil.createNode({id: node1}))
    .addFlow(branchesNode1, ProcedureUtil.createFlow({id: flow1}))
    .addFlowStart(flow1, node1)
    .addNodeLeaves(node1, [ProcedureUtil.createLeaf({id: leaf1})])
    .addNodeNexts(node1, [node1])
    .exec();

  let procedureId = procedure.id;
  let procedureStartId = procedure.start;

  expect(JSON.stringify(nextProcedure)).toBe(
    `{"id":"${procedureId}","start":"${procedureStartId}","flows":[{"id":"${procedureStartId}","nodes":["branchesNode1"]},{"id":"flow1","nodes":["node1"]}],"nodes":[{"id":"branchesNode1","type":"branchesNode","flows":["flow1"],"nexts":[]},{"id":"node1","type":"node","nexts":["node1"],"leaves":[{"id":"leaf1","type":"done"}]}]}`,
  );

  nextProcedure = ProcedureUtil.chain(nextProcedure)
    .updateFlow({
      ...ProcedureUtil.requireFlow(nextProcedure, flow1),
      outputs: {hello: 'thank you'},
    })
    .updateNode({
      ...ProcedureUtil.requireNode(nextProcedure, node1),
      outputs: {hello: 'thank you'},
    })
    .updateNodeLeaf(node1, {
      ...ProcedureUtil.requireLeaf(
        ProcedureUtil.requireNode(nextProcedure, node1),
        leaf1,
      ),
      type: 'terminate',
    })
    .exec();

  expect(JSON.stringify(nextProcedure)).toBe(
    `{"id":"${procedureId}","start":"${procedureStartId}","flows":[{"id":"${procedureStartId}","nodes":["branchesNode1"]},{"id":"flow1","nodes":["node1"],"outputs":{"hello":"thank you"}}],"nodes":[{"id":"branchesNode1","type":"branchesNode","flows":["flow1"],"nexts":[]},{"id":"node1","type":"node","nexts":["node1"],"leaves":[{"id":"leaf1","type":"terminate"}],"outputs":{"hello":"thank you"}}]}`,
  );

  let leaf2 = 'leaf2' as LeafId;

  nextProcedure = ProcedureUtil.chain(nextProcedure)
    .replaceNodeNexts(node1, [branchesNode1])
    .replaceNodeLeaves(node1, [ProcedureUtil.createLeaf({id: leaf2})])
    .exec();

  expect(JSON.stringify(nextProcedure)).toBe(
    `{"id":"${procedureId}","start":"${procedureStartId}","flows":[{"id":"${procedureStartId}","nodes":["branchesNode1"]},{"id":"flow1","nodes":["node1"],"outputs":{"hello":"thank you"}}],"nodes":[{"id":"branchesNode1","type":"branchesNode","flows":["flow1"],"nexts":[]},{"id":"node1","type":"node","nexts":["branchesNode1"],"leaves":[{"id":"leaf2","type":"done"}],"outputs":{"hello":"thank you"}}]}`,
  );

  nextProcedure = ProcedureUtil.chain(nextProcedure)
    .removeNodeLeaf(node1, leaf2)
    .removeNodeLeaves(node1)
    .removeNodeNext(node1, branchesNode1)
    .removeNodeNexts(node1)
    .removeNode(node1)
    .removeAllFlowStart(procedureStartId, branchesNode1)
    .removeFlowStart(flow1, node1)
    .removeFlow(branchesNode1, flow1)
    .exec();

  expect(JSON.stringify(nextProcedure)).toBe(
    `{"id":"${procedureId}","start":"${procedureStartId}","flows":[{"id":"${procedureStartId}","nodes":[]}],"nodes":[{"id":"branchesNode1","type":"branchesNode","flows":[],"nexts":[]}]}`,
  );

  nextProcedure = ProcedureUtil.chain(nextProcedure).purge().exec();

  expect(JSON.stringify(nextProcedure)).toBe(
    `{"id":"${procedureId}","start":"${procedureStartId}","flows":[{"id":"${procedureStartId}","nodes":[]}],"nodes":[]}`,
  );
});
