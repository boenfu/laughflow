/* eslint-disable @mufan/import-path-shallowest */

import type {BranchesNode, Flow, SingleNode} from '../../library';
import {
  addFlow,
  addFlowStart,
  addNode,
  addNodeNexts,
  compose,
  variables,
} from '../../library/operators/namespace';
import {
  createBranchesNode,
  createEmptyProcedure,
  createFlow,
  createNode,
} from '../../library/utils/namespace';

test('variables operator', () => {
  let procedure = createEmptyProcedure();

  procedure = variables<{
    sNode: SingleNode;
    bNode: BranchesNode;
    flows: [Flow];
  }>([
    $ => $.out(addNode(createNode()), 'sNode'),
    $ => $.out(addNode(createBranchesNode()), 'bNode'),
    $ =>
      compose([
        addNodeNexts($.sNode.id, [$.bNode.id]),
        addNodeNexts($.bNode.id, [$.sNode.id]),
        addFlowStart(procedure.start, $.sNode.id),
      ]),
    $ => $.outs(addFlow($.bNode.id, createFlow()), 'flows'),
    $ => addFlowStart($.flows[0].id, $.sNode.id),
  ])(procedure);

  expect(procedure.nodes.length).toBe(2);
  expect(procedure.flows.length).toBe(2);
});
