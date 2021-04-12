import React, {FC} from 'react';
import styled from 'styled-components';

import {transition} from '../../components';

export interface LeafProps {}

const Wrapper = styled.div`
  margin: 0 16px;
  display: inline-block;
  text-align: center;
  vertical-align: top;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  ${transition(['opacity'])}
`;

export const Leaf: FC<LeafProps> = ({}) => {
  // const {editor} = useContext(EditorContext);

  // let Component = LeafTypeToRender[leaf.type];

  // if (!Component) {
  //   return <></>;
  // }

  // const onDelete = (): void => void editor.procedure.deleteLeaf(prev, leaf.id);

  return (
    <Wrapper>
      {/* <TooltipActions
        actions={[
          {
            name: 'delete',
            icon: <Trash />,
            content: '删除',
            onAction: onDelete,
          },
        ]}
      >
        <LeafContent>{createElement(Component, {leaf})}</LeafContent>
      </TooltipActions> */}
    </Wrapper>
  );
};
