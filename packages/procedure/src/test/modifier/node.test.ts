import {LeafId, NodeId} from '@magicflow/core';

import {ProcedureModifier, ProcedureUtil} from '../../library';

const procedure = ProcedureModifier.addNode(
  ProcedureUtil.createEmptyProcedure(),
  ProcedureUtil.createNode(),
);

const headNodeId = procedure.nodes[0].id;

test('addNode', () => {
  expect(
    ProcedureModifier.addNode(procedure, ProcedureUtil.createNode()).nodes
      .length,
  ).toBe(2);
});

test('updateNode', () => {
  expect(
    ProcedureModifier.updateNode(procedure, {
      ...procedure.nodes[0],
      outputs: {hello: 'thank you'},
    }).nodes[0].outputs?.['hello'],
  ).toBe('thank you');
});

test('updateNode error', () => {
  expect(() =>
    ProcedureModifier.updateNode(procedure, {
      ...procedure.nodes[0],
      id: 'fakeNode' as NodeId,
    }),
  ).toThrow("Not found node definition by id 'fakeNode'");
});

test('removeNode', () => {
  let [nextProcedure, removedNode] = ProcedureModifier.removeNode(
    procedure,
    headNodeId,
  );

  expect(nextProcedure.nodes.length).toBe(0);
  expect(removedNode.id).toBe(headNodeId);
});

test('replaceNodeNexts', () => {
  expect(
    ProcedureModifier.replaceNodeNexts(procedure, headNodeId, [
      headNodeId,
      headNodeId,
    ]).nodes[0].nexts.length,
  ).toBe(2);
});

test('replaceNodeLeaves', () => {
  let oldLeaf = ProcedureUtil.createLeaf();
  let newProcedure = ProcedureModifier.addNodeLeaves(procedure, headNodeId, [
    oldLeaf,
  ]);

  expect(
    ProcedureModifier.replaceNodeLeaves(newProcedure, headNodeId, [
      ProcedureUtil.createLeaf(),
    ]).nodes[0].leaves?.[0].id,
  ).not.toBe(oldLeaf.id);
});

test('addNodeNexts', () => {
  expect(
    ProcedureModifier.addNodeNexts(procedure, headNodeId, [headNodeId]).nodes[0]
      .nexts.length,
  ).toBe(1);
});

test('addNodeLeaves', () => {
  expect(
    ProcedureModifier.addNodeLeaves(procedure, headNodeId, [
      ProcedureUtil.createLeaf(),
    ]).nodes[0].leaves?.length,
  ).toBe(1);
});

test('removeNodeNext', () => {
  expect(
    ProcedureModifier.removeNodeNext(
      ProcedureModifier.addNodeNexts(procedure, headNodeId, [headNodeId]),
      headNodeId,
      headNodeId,
    ).nodes[0].nexts.length,
  ).toBe(0);
});

test('removeNodeNext error', () => {
  expect(() =>
    ProcedureModifier.removeNodeNext(
      ProcedureModifier.addNodeNexts(procedure, headNodeId, [headNodeId]),
      headNodeId,
      'fakeNode' as NodeId,
    ),
  ).toThrow("Not found node next by id 'fakeNode'");
});

test('removeNodeNexts', () => {
  let [nextProcedure, removedIds] = ProcedureModifier.removeNodeNexts(
    ProcedureModifier.addNodeNexts(procedure, headNodeId, [headNodeId]),
    headNodeId,
  );

  expect(nextProcedure.nodes[0].nexts.length).toBe(0);
  expect(removedIds.length).toBe(1);
});

test('updateNodeLeaf', () => {
  let leaf = ProcedureUtil.createLeaf();

  expect(
    ProcedureModifier.updateNodeLeaf(
      ProcedureModifier.addNodeLeaves(procedure, headNodeId, [leaf]),
      headNodeId,
      {...leaf, type: 'terminate'},
    ).nodes[0].leaves?.[0].type,
  ).toBe('terminate');
});

test('updateNodeLeaf error', () => {
  let leaf = ProcedureUtil.createLeaf();

  expect(() =>
    ProcedureModifier.updateNodeLeaf(procedure, headNodeId, {
      ...leaf,
      type: 'terminate',
    }),
  ).toThrow(`Not found leaf definition by id '${leaf.id}'`);

  expect(() =>
    ProcedureModifier.updateNodeLeaf(
      ProcedureModifier.addNodeLeaves(procedure, headNodeId, [leaf]),
      headNodeId,
      {...leaf, type: 'terminate', id: 'fakeLeaf' as LeafId},
    ),
  ).toThrow("Not found leaf definition by id 'fakeLeaf'");
});

test('removeNodeLeaf', () => {
  let leaf = ProcedureUtil.createLeaf();
  let [nextProcedure, removedLeaf] = ProcedureModifier.removeNodeLeaf(
    ProcedureModifier.addNodeLeaves(procedure, headNodeId, [leaf]),
    headNodeId,
    leaf.id,
  );

  expect(nextProcedure.nodes[0].leaves?.length).toBe(0);
  expect(leaf.id).toBe(removedLeaf.id);
});

test('removeNodeLeaf error', () => {
  let leaf = ProcedureUtil.createLeaf();

  expect(() =>
    ProcedureModifier.removeNodeLeaf(procedure, headNodeId, leaf.id),
  ).toThrow(`Not found leaf definition by id '${leaf.id}'`);

  expect(() =>
    ProcedureModifier.removeNodeLeaf(
      ProcedureModifier.addNodeLeaves(procedure, headNodeId, [leaf]),
      headNodeId,
      'fakeLeaf' as LeafId,
    ),
  ).toThrow("Not found leaf definition by id 'fakeLeaf'");
});

test('removeNodeLeaves', () => {
  let [nextProcedure, removedLeaves] = ProcedureModifier.removeNodeLeaves(
    ProcedureModifier.addNodeLeaves(procedure, headNodeId, [
      ProcedureUtil.createLeaf(),
    ]),
    headNodeId,
  );

  expect(nextProcedure.nodes[0].leaves?.length).toBeUndefined();
  expect(removedLeaves.length).toBe(1);
});
