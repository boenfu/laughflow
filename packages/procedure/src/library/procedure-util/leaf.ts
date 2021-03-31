import {Leaf} from '@magicflow/core';

import {createId} from './common';

export function createLeaf({
  id: _id,
  type = 'done',
  ...partial
}: Partial<Leaf> = {}): Leaf {
  return {
    id: createId(),
    type,
    ...partial,
  };
}
