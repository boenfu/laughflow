import {
  LeafMetadata,
  NodeId,
  NodeMetadata,
  ProcedureDefinition,
  ProcedureId,
} from '@magicflow/core';

import {Procedure} from '../../../library';

let nodeId = 'node1' as NodeId;

type NodeMetadataWithName = {name?: string} & NodeMetadata;
type LeafMetadataWithName = {name?: string} & LeafMetadata;

let definition: ProcedureDefinition<
  {},
  NodeMetadataWithName,
  LeafMetadataWithName
> = {
  id: 'procedure1' as ProcedureId,
  metadata: {},
  leaves: [],
  nodes: [
    {
      id: nodeId,
    },
  ],
};

test('update node', async () => {
  let procedure = new Procedure(definition);

  await procedure.updateNode({id: nodeId, name: 'hello'});

  expect(procedure.definition.nodes[0]?.name).toBe('hello');
});

test('update node error params', () => {
  let procedure = new Procedure(definition);

  void expect(
    procedure.updateNode({id: 'node2' as NodeId, name: 'hello'}),
  ).rejects.toThrow("Not found node metadata by id 'node2'");
});
