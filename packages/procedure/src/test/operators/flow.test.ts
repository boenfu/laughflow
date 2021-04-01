/* eslint-disable @mufan/import-path-shallowest */
import {FlowId, NodeId} from '@magicflow/core';

import {
  addFlow,
  addFlowStart,
  addNode,
  compose,
  out,
  removeAllFlowStart,
  removeFlow,
  removeFlowStart,
  updateFlow,
} from '../../library/operators/namespace';
import {
  createBranchesNode,
  createEmptyProcedure,
  createFlow,
} from '../../library/utils/namespace';

const node1 = 'node1' as NodeId;
const procedure = compose([addNode(createBranchesNode({id: node1}))])(
  createEmptyProcedure(),
);

test('addFlow', () => {
  expect(addFlow(node1, createFlow())(procedure)[0].flows.length).toBe(2);
});

test('updateFlow', () => {
  expect(
    updateFlow({
      ...procedure.flows[0],
      outputs: {hello: 'thank you'},
    })(procedure).flows[0].outputs?.['hello'],
  ).toBe('thank you');
});

test('removeFlow', () => {
  let flow1 = 'flow1' as FlowId;

  expect(
    compose([
      addFlow(node1, createFlow({id: flow1})),
      out(removeFlow(node1, flow1), removedFlow => {
        expect(removedFlow.id).toBe(flow1);
      }),
    ])(procedure).flows.length,
  ).toBe(1);
});

test('addFlowStart', () => {
  expect(
    compose([
      addFlowStart(procedure.start, node1),
      addFlowStart(procedure.start, node1),
    ])(procedure).flows[0].nodes.length,
  ).toBe(2);
});

test('removeFlowStart', () => {
  expect(
    compose([
      addFlowStart(procedure.start, node1),
      removeFlowStart(procedure.start, node1),
    ])(procedure).flows[0].nodes.length,
  ).toBe(0);
});

test('removeAllFlowStart', () => {
  expect(
    compose([
      addFlowStart(procedure.start, node1),
      addFlowStart(procedure.start, node1),
      removeAllFlowStart(procedure.start, node1),
    ])(procedure).flows[0].nodes.length,
  ).toBe(0);
});
