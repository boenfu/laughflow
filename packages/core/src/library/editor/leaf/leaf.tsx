import React, {FC} from 'react';
import styled from 'styled-components';

import {LeafMetadata, LeafType} from '../../core';

import {DoneLeaf} from './@done';
import {TerminateLeaf} from './@terminate';
import {WormholeLeaf} from './@wormhole';

export interface LeafProps {
  leaf: LeafMetadata;
}

const Wrapper = styled.div`
  margin: 0 16px;
  display: inline-block;
  text-align: center;
  vertical-align: top;
`;

const LEAF_COMPONENTS: Partial<
  {[key in LeafType]: FC<{leaf: LeafMetadata}>}
> = {
  done: DoneLeaf,
  terminate: TerminateLeaf,
  wormhole: WormholeLeaf,
};

export const Leaf: FC<LeafProps> = ({leaf}) => {
  let Leaf = LEAF_COMPONENTS[leaf.type]!;

  return (
    <Wrapper>
      <Leaf leaf={leaf} />
    </Wrapper>
  );
};
