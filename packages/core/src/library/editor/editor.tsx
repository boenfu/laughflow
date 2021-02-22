import {useCreation, useUpdate} from 'ahooks';
import {enableAllPlugins} from 'immer';
import {sortBy} from 'lodash-es';
import React, {FC, Fragment, ReactNode, useEffect} from 'react';
import styled, {ThemeProvider} from 'styled-components';

import {THEME_DEFAULT} from '../components';
import {LeafId, NodeId, Procedure, ProcedureNodeEdge} from '../core';

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

  let {nodes, leaves} = procedure.definition;

  let nodeMap = new Map(nodes.map(node => [node.id, node]));
  let leafMap = new Map(leaves.map(leaf => [leaf.id, leaf]));

  function renderNode(
    nodeEdge: ProcedureNodeEdge,
    boundary?: ConnectionLineBoundary,
  ): ReactNode {
    let node = nodeEdge.to;
    let nodeMetadata = nodeMap.get(node)! || {id: node};

    return (
      <Fragment>
        {node !== 'start' ? (
          <ConnectionLine type="node" edge={nodeEdge} boundary={boundary} />
        ) : undefined}
        <Node className={node === 'start' ? 'active' : ''} node={nodeMetadata}>
          <Row>
            {sortBy(
              nodeMetadata.nexts || [],
              ({type}) => +!(type === 'leaf'),
            ).map(({type, id}, index) => {
              let boundary: ConnectionLineBoundary | undefined =
                index === 0
                  ? 'start'
                  : index === nodeMetadata.nexts!.length - 1
                  ? 'end'
                  : undefined;

              if (type === 'leaf') {
                let leafId = id as LeafId;

                return (
                  <Fragment key={`leaf:${nodeMetadata.id}-${leafId}`}>
                    <Leaf leaf={leafMap.get(leafId)!} />
                    <ConnectionLine
                      type="leaf"
                      edge={{from: nodeMetadata.id, leaf: leafId}}
                      boundary={boundary}
                    />
                  </Fragment>
                );
              }

              return (
                <Fragment key={`node:${nodeMetadata.id}-${id}`}>
                  {renderNode(
                    {from: nodeMetadata.id, to: id as NodeId},
                    boundary,
                  )}
                </Fragment>
              );
            })}
          </Row>
        </Node>
      </Fragment>
    );
  }

  return (
    <ThemeProvider theme={THEME_DEFAULT}>
      <Wrapper>
        <EditorContext.Provider value={{procedure}}>
          <button onClick={() => procedure.undo()}>undo</button>
          <button onClick={() => procedure.redo()}>redo</button>
          {renderNode({from: '', to: 'start'} as ProcedureNodeEdge)}
        </EditorContext.Provider>
      </Wrapper>
    </ThemeProvider>
  );
};
