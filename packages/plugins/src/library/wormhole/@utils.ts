import {NodeMetadata} from '@magicflow/core';

export function getNodeDisplayName(nodeMetadata: NodeMetadata): string {
  return nodeMetadata.displayName || nodeMetadata.id;
}
