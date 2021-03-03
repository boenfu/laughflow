import {useCreation, useUpdate} from 'ahooks';
import React, {FC, Fragment, ReactNode, useEffect} from 'react';
import styled, {ThemeProvider} from 'styled-components';

import {EditorContext} from '../../context';
import {Editor, ProcedureTreeNode} from '../../editor';
import {THEME_DEFAULT} from '../theme';

import {ConnectionLine, LINE_HEIGHT_DEFAULT} from './connection-line';
import {EditorProps} from './editor.doc';
import {Leaf} from './leaf';
import {LinkNode, Node} from './node';

declare module '@magicflow/core' {
  interface NodeMetadata {
    displayName?: string;
  }
}

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

export const FlowEditor: FC<EditorProps> = ({definition, plugins}) => {
  const editor = useCreation(() => new Editor(definition, plugins), []);
  const reRender = useUpdate();

  useEffect(() => {
    editor.on('update', () => {
      reRender();
      console.log(editor.procedure);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderNode({
    metadata,
    leaves,
    nodes,
    links,
  }: ProcedureTreeNode): ReactNode {
    let nodeId = metadata.id;

    return (
      <Fragment>
        <Node node={metadata}>
          <Row>
            {leaves.map((leaf, index) => (
              <Fragment key={`leaf:${nodeId}-${leaf.id}`}>
                <ConnectionLine
                  node={nodeId}
                  next={{type: 'leaf', id: leaf.id}}
                  left={leaves[index - 1]?.id}
                  right={
                    leaves[index + 1]?.id ||
                    nodes[0]?.metadata.id ||
                    links[0]?.id
                  }
                />
                <Leaf leaf={leaf} />
              </Fragment>
            ))}

            {nodes.map((treeNode, index) => (
              <Fragment key={`node:${nodeId}-${treeNode.metadata.id}`}>
                <ConnectionLine
                  node={nodeId}
                  next={{type: 'node', id: treeNode.metadata.id}}
                  left={
                    nodes[index - 1]?.metadata.id ||
                    leaves[leaves.length - 1]?.id
                  }
                  right={nodes[index + 1]?.metadata.id || links[0]?.id}
                />
                {renderNode(treeNode)}
              </Fragment>
            ))}

            {links.map((linkNode, index) => (
              <Fragment key={`node:${nodeId}-${linkNode.id}`}>
                <ConnectionLine
                  node={nodeId}
                  next={{type: 'node', id: linkNode.id}}
                  left={
                    links[index - 1]?.id ||
                    nodes[leaves.length - 1]?.metadata.id
                  }
                  right={links[index + 1]?.id}
                />
                <LinkNode node={linkNode} />
              </Fragment>
            ))}
          </Row>
        </Node>
      </Fragment>
    );
  }

  return (
    <ThemeProvider theme={THEME_DEFAULT}>
      <Wrapper>
        <EditorContext.Provider value={{editor}}>
          <button onClick={() => editor.procedure.undo()}>undo</button>
          <button onClick={() => editor.procedure.redo()}>redo</button>
          {renderNode(editor.procedureTreeNode)}
        </EditorContext.Provider>
      </Wrapper>
    </ThemeProvider>
  );
};
