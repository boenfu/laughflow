import {BranchesNode, Leaf, LeafId, Node} from '@magicflow/core';

import {createId} from './common';

export function createLeaf({
  id = createId()!,
  type = 'done',
  ...partial
}: Partial<Leaf> = {}): Leaf {
  return {
    id,
    type,
    ...partial,
  };
}

export function requireLeaf(node: Node | BranchesNode, leafId: LeafId): Leaf {
  let leaf = node.leaves?.find(leaf => leaf.id === leafId);

  if (!leaf) {
    throw Error(`Not found leaf definition by id '${leafId}'`);
  }

  return leaf;
}
