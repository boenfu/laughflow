/* eslint-disable @mufan/import-path-shallowest */
import {NodeId} from '../../library';
import {
  addNode,
  addNodeNexts,
  compose,
  out,
  removeNode,
  removeNodeNext,
  removeNodeNexts,
  replaceNodeNext,
  replaceNodeNexts,
  updateNode,
} from '../../library/operators/namespace';
import {createEmptyProcedure, createNode} from '../../library/utils/namespace';

const procedure = addNode(createNode())(createEmptyProcedure())[0];

const headNodeId = procedure.nodes[0].id;

test('addNode', () => {
  expect(addNode(createNode())(procedure)[0].nodes.length).toBe(2);
});

test('updateNode', () => {
  expect(
    updateNode({
      ...procedure.nodes[0],
      outputs: {hello: 'thank you'},
    })(procedure).nodes[0].outputs?.['hello'],
  ).toBe('thank you');
});

test('updateNode error', () => {
  expect(() =>
    updateNode({
      ...procedure.nodes[0],
      id: 'fakeNode' as NodeId,
    })(procedure),
  ).toThrow("Not found node definition by id 'fakeNode'");
});

test('removeNode', () => {
  expect(
    out(removeNode(headNodeId), removedNode => {
      expect(removedNode.id).toBe(headNodeId);
    })(procedure).nodes.length,
  ).toBe(0);
});

test('replaceNodeNexts', () => {
  expect(
    replaceNodeNexts(headNodeId, [headNodeId, headNodeId])(procedure)[0]
      .nodes[0].nexts.length,
  ).toBe(2);
});

test('replaceNodeNext', () => {
  expect(
    compose([
      addNodeNexts(headNodeId, [headNodeId]),
      replaceNodeNext(headNodeId, headNodeId, headNodeId),
    ])(procedure).nodes[0].nexts.length,
  ).toBe(1);
});

test('replaceNodeNext error', () => {
  expect(() =>
    replaceNodeNext(headNodeId, headNodeId, headNodeId)(procedure),
  ).toThrow(`Not found node definition by id '${headNodeId}'`);
});

test('addNodeNexts', () => {
  expect(
    addNodeNexts(headNodeId, [headNodeId])(procedure).nodes[0].nexts.length,
  ).toBe(1);
});

test('removeNodeNext', () => {
  expect(
    compose([
      addNodeNexts(headNodeId, [headNodeId]),
      removeNodeNext(headNodeId, headNodeId),
    ])(procedure).nodes[0].nexts.length,
  ).toBe(0);
});

test('removeNodeNext error', () => {
  expect(() =>
    compose([
      addNodeNexts(headNodeId, [headNodeId]),
      removeNodeNext(headNodeId, 'fakeNode' as NodeId),
    ])(procedure),
  ).toThrow("Not found node next by id 'fakeNode'");
});

test('removeNodeNexts', () => {
  expect(
    compose([
      addNodeNexts(headNodeId, [headNodeId]),
      out(removeNodeNexts(headNodeId), removedIds => {
        expect(removedIds.length).toBe(1);
      }),
    ])(procedure).nodes[0].nexts.length,
  ).toBe(0);
});
