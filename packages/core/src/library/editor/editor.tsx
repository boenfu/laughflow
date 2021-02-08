import {useCreation, useUpdate} from 'ahooks';
import {enableAllPlugins} from 'immer';
import {groupBy, sortBy} from 'lodash-es';
import React, {FC, Fragment, ReactNode, useEffect} from 'react';
import styled, {ThemeProvider} from 'styled-components';

import {THEME_DEFAULT} from '../components';
import {Procedure, ProcedureEdge, ProcedureNodeEdge} from '../core';

import {
  ConnectionLine,
  ConnectionLineBoundary,
  LINE_HEIGHT_DEFAULT,
} from './connection-line';
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
  padding-top: ${LINE_HEIGHT_DEFAULT}px;
  text-align: center;
`;

export const Editor: FC<EditorProps> = ({definition, plugins}) => {
  const procedure = useCreation(() => new Procedure(definition, plugins), []);
  const reRender = useUpdate();

  useEffect(() => {
    procedure.on('update', reRender);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let {edges, nodes, leaves} = procedure.definition;

  let fromMap = groupBy<ProcedureEdge>(edges, edge => edge.from);
  let nodeMap = new Map(nodes.map(node => [node.id, node]));
  let leafMap = new Map(leaves.map(leaf => [leaf.id, leaf]));

  function renderNode(
    nodeEdge: ProcedureNodeEdge,
    boundary?: ConnectionLineBoundary,
  ): ReactNode {
    let node = nodeEdge.to;
    let edges = fromMap[node] || [];

    return (
      <EditorContext.Provider value={{procedure}}>
        {node !== 'start' ? (
          <ConnectionLine type="node" edge={nodeEdge} boundary={boundary} />
        ) : undefined}
        <Node
          className={node === 'start' ? 'active' : ''}
          node={nodeMap.get(node)! || {id: node}}
        >
          <Row>
            {sortBy(edges, edge => +!('leaf' in edge)).map((edge, index) => {
              let boundary: ConnectionLineBoundary | undefined =
                index === 0
                  ? 'start'
                  : index === edges.length - 1
                  ? 'end'
                  : undefined;

              if ('leaf' in edge) {
                return (
                  <Fragment key={`leaf:${edge.from}-${edge.leaf}`}>
                    <Leaf leaf={leafMap.get(edge.leaf)!} />
                    <ConnectionLine
                      type="leaf"
                      edge={edge}
                      boundary={boundary}
                    />
                  </Fragment>
                );
              }

              return (
                <Fragment key={`node:${edge.from}-${edge.to}`}>
                  {renderNode(edge, boundary)}
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
