import {Leaf, LeafId, Ref} from '@magicflow/core';
import {useCreation, useUpdate} from 'ahooks';
import classNames from 'classnames';
import React, {FC, Fragment, ReactNode, useEffect, useRef} from 'react';
import styled from 'styled-components';

import {ConditionPlugin} from '../condition';
import {EditorContext} from '../context';
import {Editor, ProcedureTreeNode} from '../procedure-editor/procedure-editor';

import {Footer} from './@footer';
import {Navigation} from './@navigation';
import {ConnectionLine, LINE_HEIGHT_DEFAULT} from './connection-line';
import {EditorProps} from './editor.doc';
import {Joint} from './joint';
import {Leaf} from './leaf';
import {LinkNode, SingleNode} from './node';

const PlaceholderLeafId = 'placeholder' as LeafId;

const PlaceholderLeaf: Leaf = {
  type: 'done',
  id: PlaceholderLeafId,
};

declare global {
  namespace Magicflow {
    interface SingleNodeExtension {
      displayName?: string;
    }
  }
}

const Wrapper = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

const Content = styled.div`
  height: 100%;
  width: 100%;
  padding: 64px;
  box-sizing: border-box;
  text-align: center;
  overflow: auto;
  background-color: #e5e7eb;
`;

const Row = styled.div`
  padding-top: ${LINE_HEIGHT_DEFAULT}px;
  text-align: center;

  &.multi {
    padding-top: ${LINE_HEIGHT_DEFAULT * 2}px;
  }
`;

export const FlowEditor: FC<EditorProps> = ({
  definition,
  plugins,
  onConfig,
}) => {
  // eslint-disable-next-line no-null/no-null
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editor = useCreation(
    () => new Editor(definition, [...(plugins || []), new ConditionPlugin()]),
    [],
  );
  const reRender = useUpdate();

  const onFullScreenToggle = (): void => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void wrapperRef.current?.requestFullscreen();
    }
  };

  const onContentClick = (): void => {
    if (editor.activeTrunk) {
      editor.setActiveTrunk(undefined);
    }
  };

  useEffect(() => {
    editor.on('update', () => {
      reRender();
      console.info(editor.procedure);
    });

    if (onConfig) {
      editor.on('config', onConfig);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderNode(node: ProcedureTreeNode): ReactNode {
    if (isTypeTreeNode(node, 'leaf')) {
      return <Leaf prev={node.prev!.ref} leaf={node.metadata} />;
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

    let children = (
      <Row className={classNames({multi: nexts.length > 1})}>
        {nexts.map((next, index, array) => {
          return (
            <Fragment key={`node:${node.ref.id}-${next.ref.id}`}>
              <ConnectionLine
                node={node.ref}
                next={next.ref}
                first={index === 0 && array.length > 1}
                last={index === array.length - 1 && array.length > 1}
              />
              {renderNode(next)}
            </Fragment>
          );
        })}
      </Row>
    );

    return (
      <Fragment>
        {isTypeTreeNode(node, 'node') ? (
          <Node prev={node.prev?.ref} node={node.metadata}>
            {children}
          </Node>
        ) : (
          <Joint prev={node.prev!.ref} joint={node.metadata}>
            {children}
          </Joint>
        )}
      </Fragment>
    );
  }

  return (
    <Wrapper ref={wrapperRef}>
      <EditorContext.Provider value={{editor}}>
        <Navigation onFullScreenToggle={onFullScreenToggle} />
        <Content onClick={onContentClick}>
          {renderNode(editor.procedureTreeNode)}
        </Content>
        <Footer />
        {/* <ConditionModal /> */}
      </EditorContext.Provider>
    </Wrapper>
  );
};

function isTypeTreeNode<TType extends Ref['type']>(
  node: ProcedureTreeNode,
  type: TType,
): node is Extract<ProcedureTreeNode, {ref: {type: TType}}> {
  return node.ref.type === type;
}
