import {LeafId, LeafMetadata, Ref} from '@magicflow/core';
import {useCreation, useEventListener, useUpdate} from 'ahooks';
import React, {FC, Fragment, ReactNode, useEffect} from 'react';
import styled, {ThemeProvider} from 'styled-components';

import {EditorContext} from '../../context';
import {Editor, ProcedureNodeTreeNode, ProcedureTreeNode} from '../../editor';
import {THEME_DEFAULT} from '../theme';

import {ConnectionLine, LINE_HEIGHT_DEFAULT} from './connection-line';
import {EditorProps} from './editor.doc';
import {Joint} from './joint';
import {Leaf} from './leaf';
import {LinkNode, Node} from './node';

const PlaceholderLeafId = 'placeholder' as LeafId;

const PlaceholderLeaf: LeafMetadata = {
  type: 'done',
  id: PlaceholderLeafId,
};

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

  useEventListener('click', () => {
    if (editor.statefulNode) {
      editor.setStatefulNode(undefined);
    }
  });

  useEffect(() => {
    editor.on('update', () => {
      reRender();
      console.log(editor.procedure);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderNode(node: ProcedureTreeNode): ReactNode {
    if (isTypeTreeNode(node, 'leaf')) {
      return <Leaf leaf={node.metadata} />;
    }

    let nexts = node.nexts;

    if (nexts === false) {
      if (isTypeTreeNode(node, 'node')) {
        return <LinkNode prev={node.prev!.ref} node={node.metadata} />;
      }

      if (isTypeTreeNode(node, 'joint')) {
        return <Joint prev={node.prev!.ref} joint={node.metadata} />;
      }

      return <></>;
    } else if (!nexts.length) {
      // placeholder leaf
      nexts = [
        {
          prev: node,
          ref: {
            type: 'leaf',
            id: PlaceholderLeafId,
          },
          metadata: PlaceholderLeaf,
          nexts: false,
        },
      ];
    }

    let {ref, prev, metadata} = node as ProcedureNodeTreeNode;

    return (
      <Fragment>
        <Node prev={prev?.ref} node={metadata}>
          <Row>
            {nexts.map((next, index, array) => {
              return (
                <Fragment key={`node:${ref.id}-${next.ref.id}`}>
                  <ConnectionLine
                    node={prev!.ref}
                    next={ref}
                    first={index === 0}
                    last={index === array.length - 1}
                  />
                  {renderNode(next)}
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
        <EditorContext.Provider value={{editor}}>
          <button onClick={() => editor.procedure.undo()}>undo</button>
          <button onClick={() => editor.procedure.redo()}>redo</button>
          {renderNode(editor.procedureTreeNode)}
        </EditorContext.Provider>
      </Wrapper>
    </ThemeProvider>
  );
};

function isTypeTreeNode<TType extends Ref['type']>(
  node: ProcedureTreeNode,
  type: TType,
): node is Extract<ProcedureTreeNode, {ref: {type: TType}}> {
  return node.ref.type === type;
}
