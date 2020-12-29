import {enableAllPlugins} from 'immer';
import {groupBy, sortBy} from 'lodash-es';
import React, {FC, Fragment, ReactNode, useState} from 'react';
import styled, {ThemeProvider} from 'styled-components';

import {THEME_DEFAULT} from '../components';
import {
  Procedure,
  ProcedureDefinition,
  ProcedureEdge,
  ProcedureNodeEdge,
} from '../core';

import {ConnectionLine} from './connection-line';
import {EditorContext} from './context';
import {EditorProps} from './editor.doc';
import {Leaf} from './leaf';
import {Node} from './node';

enableAllPlugins();

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 64px;
  text-align: center;
  overflow: auto;
`;

const Row = styled.div`
  padding-top: 68px;
  text-align: center;
`;

export const Editor: FC<EditorProps> = props => {
  const [definition, setDefinition] = useState<ProcedureDefinition>(
    props.definition,
  );

  const {edges, nodes, leaves} = definition;

  const fromMap = groupBy<ProcedureEdge>(edges, edge => edge.from);
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const leafMap = new Map(leaves.map(leaf => [leaf.id, leaf]));

  const procedure = new Procedure(definition, setDefinition);

  function renderNode(nodeEdge: ProcedureNodeEdge): ReactNode {
    let node = nodeEdge.to;
    let edges = fromMap[node] || [];

    return (
      <EditorContext.Provider value={{props, procedure}}>
        {node !== 'start' ? (
          <ConnectionLine type="node" edge={nodeEdge} />
        ) : undefined}
        <Node
          className={node === 'start' ? 'active' : ''}
          node={nodeMap.get(node)! || {id: node}}
        >
          <Row>
            {sortBy(edges, edge => +!('leaf' in edge)).map(edge => {
              if ('leaf' in edge) {
                return (
                  <Fragment key={`leaf:${edge.from}-${edge.leaf}`}>
                    <Leaf leaf={leafMap.get(edge.leaf)!} />
                    <ConnectionLine type="leaf" edge={edge} />
                  </Fragment>
                );
              }

              return (
                <Fragment key={`node:${edge.from}-${edge.to}`}>
                  {renderNode(edge)}
                </Fragment>
              );
            })}
          </Row>
        </Node>
      </EditorContext.Provider>
    );
  }

  return (
    <ThemeProvider theme={THEME_DEFAULT}>
      <Wrapper>
        {renderNode({from: '', to: 'start'} as ProcedureNodeEdge)}
      </Wrapper>
    </ThemeProvider>
  );
};
