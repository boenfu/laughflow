import {enableAllPlugins} from 'immer';
import {castArray, groupBy, sortBy} from 'lodash-es';
import React, {FC, Fragment, ReactNode, useEffect, useState} from 'react';
import styled, {ThemeProvider} from 'styled-components';

import {THEME_DEFAULT} from '../components';
import {
  Procedure,
  ProcedureDefinition,
  ProcedureEdge,
  ProcedureNodeEdge,
} from '../core';
import {ILeafPlugin} from '../plugin';

import {
  ConnectionLine,
  ConnectionLineBoundary,
  LINE_HEIGHT_DEFAULT,
} from './connection-line';
import {EditorContext} from './context';
import {EditorProps} from './editor.doc';
import {Leaf, doneLeaf, terminateLeaf} from './leaf';
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

export const Editor: FC<EditorProps> = props => {
  const [definition, setDefinition] = useState<ProcedureDefinition>(
    props.definition,
  );

  const [plugins, setPlugins] = useState<{leavesMap: any}>({
    leavesMap: new Map(),
  });

  useEffect(() => {
    let leavesMap = new Map<string, ILeafPlugin<string>>([
      ['done', doneLeaf],
      ['terminate', terminateLeaf],
    ]);

    for (let plugin of castArray(props.plugins)) {
      if (plugin?.leaves?.length) {
        for (let leaf of plugin.leaves) {
          leavesMap.set(leaf.type, leaf);
        }
      }
    }

    leavesMap = new Map(
      sortBy([...leavesMap.entries()], ([, {selectorOrder}]) => selectorOrder),
    );

    setPlugins({leavesMap});
  }, [props.plugins]);

  const {edges, nodes, leaves} = definition;

  const fromMap = groupBy<ProcedureEdge>(edges, edge => edge.from);
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const leafMap = new Map(leaves.map(leaf => [leaf.id, leaf]));

  const procedure = new Procedure(definition, setDefinition, props.plugins);

  function renderNode(
    nodeEdge: ProcedureNodeEdge,
    boundary?: ConnectionLineBoundary,
  ): ReactNode {
    let node = nodeEdge.to;
    let edges = fromMap[node] || [];

    return (
      <EditorContext.Provider value={{props, procedure, ...plugins}}>
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
