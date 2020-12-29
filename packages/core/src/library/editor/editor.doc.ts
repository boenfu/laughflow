import {
  LeafMetadata,
  LeafType,
  NodeId,
  Procedure,
  ProcedureDefinition,
} from '../core';

export interface EditorProps {
  definition: ProcedureDefinition;
  onInsertLeaf?(
    type: LeafType,
    node: NodeId,
    context: {
      procedure: Procedure;
      metadata: Partial<LeafMetadata>;
    },
  ): boolean | Partial<LeafMetadata>;
}
