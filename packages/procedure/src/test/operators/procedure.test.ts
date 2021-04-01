/* eslint-disable @mufan/import-path-shallowest */

import {
  addFlow,
  addFlowStart,
  addNode,
  addNodeLeaves,
  addNodeNexts,
  compose,
  out,
  purge,
  removeNode,
} from '../../library/operators/namespace';
import {
  createBranchesNode,
  createEmptyProcedure,
  createFlow,
  createLeaf,
  createNode,
} from '../../library/utils/namespace';

test('purge', () => {
  let procedure = createEmptyProcedure();

  procedure = compose([
    out(addNode(createBranchesNode()), branchesNode =>
      out(addFlow(branchesNode.id, createFlow()), flow =>
        out(addNode(createNode()), node => [
          addFlowStart(flow.id, node.id),
          addNodeLeaves(node.id, [createLeaf()]),
        ]),
      ),
    ),
    out(addNode(createNode()), node => [
      addFlowStart(procedure.start, node.id),
      addFlowStart(procedure.start, node.id),
      out(addNode(createBranchesNode()), branchesNode => [
        addFlow(branchesNode.id, createFlow()),
        addNodeNexts(node.id, [branchesNode.id]),
      ]),
      purge(),
      removeNode(node.id),
      purge(),
    ]),
  ])(procedure);

  expect(procedure.flows.length).toBe(1);
  expect(procedure.nodes.length).toBe(0);
});
