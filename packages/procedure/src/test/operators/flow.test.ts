/* eslint-disable @mufan/import-path-shallowest */
import type {FlowId, NodeId} from '../../library';
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

test('updateFlow error', () => {
  expect(() =>
    updateFlow(createFlow({id: 'fakeFlow' as FlowId}))(procedure),
  ).toThrow("Not found flow definition by id 'fakeFlow'");
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

test('removeFlow error', () => {
  let branchesNodeId = 'branchesNode' as NodeId;
  expect(
    removeFlow(branchesNodeId, procedure.start)(procedure)[0].flows.length,
  ).toBe(1);

  expect(() =>
    compose([
      out(addNode(createBranchesNode({id: branchesNodeId})), node =>
        removeFlow(node.id, 'fakeFlow' as FlowId),
      ),
    ])(procedure),
  ).toThrow(`Not found flow 'fakeFlow' in branchesNode '${branchesNodeId}'`);

  expect(() =>
    compose([
      out(addNode(createBranchesNode({flows: ['fakeFlow' as FlowId]})), node =>
        removeFlow(node.id, 'fakeFlow' as FlowId),
      ),
    ])(procedure),
  ).toThrow("Not found flow definition by id 'fakeFlow'");
});

test('addFlowStart', () => {
  expect(
    compose([
      addFlowStart(procedure.start, node1),
      addFlowStart(procedure.start, node1),
    ])(procedure).flows[0].starts.length,
  ).toBe(2);
});

test('removeFlowStart', () => {
  expect(
    compose([
      addFlowStart(procedure.start, node1),
      removeFlowStart(procedure.start, node1),
    ])(procedure).flows[0].starts.length,
  ).toBe(0);
});

test('removeFlowStart error', () => {
  expect(() =>
    compose([removeFlowStart(procedure.start, node1)])(procedure),
  ).toThrow("Not found flow start by id 'node1'");
});

test('removeAllFlowStart', () => {
  expect(
    compose([
      addFlowStart(procedure.start, node1),
      addFlowStart(procedure.start, node1),
      removeAllFlowStart(procedure.start, node1),
    ])(procedure).flows[0].starts.length,
  ).toBe(0);
});
