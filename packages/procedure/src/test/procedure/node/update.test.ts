import {NodeId, ProcedureDefinition, ProcedureId} from '@magicflow/core';

import {Procedure} from '../../../library';

declare global {
  namespace Magicflow {
    interface NodeMetadataExtension {
      name?: string;
    }

    interface LeafMetadataExtension {
      name?: string;
    }
  }
}

let nodeId = 'node1' as NodeId;

let definition: ProcedureDefinition = {
  id: 'procedure1' as ProcedureId,
  metadata: {},
  joints: [],
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
