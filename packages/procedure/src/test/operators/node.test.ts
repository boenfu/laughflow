/* eslint-disable @mufan/import-path-shallowest */
import {LeafId, NodeId} from '@magicflow/core';

import {
  addNode,
  addNodeLeaves,
  addNodeNexts,
  compose,
  out,
  removeNode,
  removeNodeLeaf,
  removeNodeLeaves,
  removeNodeNext,
  removeNodeNexts,
  replaceNodeLeaves,
  replaceNodeNexts,
  updateNode,
  updateNodeLeaf,
} from '../../library/operators/namespace';
import {
  createEmptyProcedure,
  createLeaf,
  createNode,
} from '../../library/utils/namespace';

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
    replaceNodeNexts(headNodeId, [headNodeId, headNodeId])(procedure).nodes[0]
      .nexts.length,
  ).toBe(2);
});

test('replaceNodeLeaves', () => {
  expect(
    compose([
      addNodeLeaves(headNodeId, [createLeaf({id: 'leaf1' as LeafId})]),
      replaceNodeLeaves(headNodeId, [createLeaf()]),
    ])(procedure).nodes[0].leaves?.[0].id,
  ).not.toBe('leaf1');
});

test('addNodeNexts', () => {
  expect(
    addNodeNexts(headNodeId, [headNodeId])(procedure).nodes[0].nexts.length,
  ).toBe(1);
});

test('addNodeLeaves', () => {
  expect(
    addNodeLeaves(headNodeId, [createLeaf()])(procedure)[0].nodes[0].leaves
      ?.length,
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

test('updateNodeLeaf', () => {
  let leaf = createLeaf();

  expect(
    compose([
      addNodeLeaves(headNodeId, [leaf]),
      updateNodeLeaf(headNodeId, {
        ...leaf,
        type: 'terminate',
      }),
    ])(procedure).nodes[0].leaves?.[0].type,
  ).toBe('terminate');
});

test('updateNodeLeaf error', () => {
  let leaf = createLeaf();

  expect(() =>
    updateNodeLeaf(headNodeId, {
      ...leaf,
      type: 'terminate',
    })(procedure),
  ).toThrow(`Not found leaf definition by id '${leaf.id}'`);

  expect(() =>
    compose([
      addNodeLeaves(headNodeId, [leaf]),
      updateNodeLeaf(headNodeId, {
        ...leaf,
        type: 'terminate',
        id: 'fakeLeaf' as LeafId,
      }),
    ])(procedure),
  ).toThrow("Not found leaf definition by id 'fakeLeaf'");
});

test('removeNodeLeaf', () => {
  let leaf = createLeaf();

  expect(
    compose([
      addNodeLeaves(headNodeId, [leaf]),
      out(removeNodeLeaf(headNodeId, leaf.id), removedLeaf => {
        expect(leaf.id).toBe(removedLeaf.id);
      }),
    ])(procedure).nodes[0].leaves?.length,
  ).toBe(0);
});

test('removeNodeLeaf error', () => {
  let leaf = createLeaf();

  expect(() => removeNodeLeaf(headNodeId, leaf.id)(procedure)).toThrow(
    `Not found leaf definition by id '${leaf.id}'`,
  );

  expect(() =>
    compose([
      addNodeLeaves(headNodeId, [leaf]),
      removeNodeLeaf(headNodeId, 'fakeLeaf' as LeafId),
    ])(procedure),
  ).toThrow("Not found leaf definition by id 'fakeLeaf'");
});

test('removeNodeLeaves', () => {
  expect(
    compose([
      addNodeLeaves(headNodeId, [createLeaf()]),
      out(removeNodeLeaves(headNodeId), removedLeaves => {
        expect(removedLeaves.length).toBe(1);
      }),
    ])(procedure).nodes[0].leaves?.length,
  ).toBeUndefined();
});
