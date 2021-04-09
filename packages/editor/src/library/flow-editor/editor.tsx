import {ProcedureFlow, ProcedureTreeNode} from '@magicflow/procedure';
import {useCreation, useUpdate} from 'ahooks';
import classNames from 'classnames';
import React, {FC, Fragment, ReactNode, useEffect, useRef} from 'react';
import styled from 'styled-components';

// import {ConditionPlugin} from '../condition';
import {EditorContext} from '../context';
import {ProcedureEditor} from '../procedure-editor';

// import {Footer} from './@footer';
import {Navigation} from './@navigation';
import {ConnectionLine, LINE_HEIGHT_DEFAULT} from './connection-line';
import {EditorProps as FlowEditorProps} from './editor.doc';
import {LinkNode, Node} from './node';

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

export const FlowEditor: FC<FlowEditorProps> = ({
  definition,
  // plugins,
  onConfig,
}) => {
  // eslint-disable-next-line no-null/no-null
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editor = useCreation(() => new ProcedureEditor(definition), []);
  const reRender = useUpdate();

  const onFullScreenToggle = (): void => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void wrapperRef.current?.requestFullscreen();
    }
  };

  // const onContentClick = (): void => {
  //   if (editor.activeTrunk) {
  //     editor.setActiveTrunk(undefined);
  //   }
  // };

  useEffect(() => {
    editor.on('update', () => {
      reRender();
    });

    if (onConfig) {
      editor.on('config', onConfig);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderNode(node: ProcedureTreeNode): ReactNode {
    let nexts = node.nexts;

    if (node.left) {
      return (
        <LinkNode
          key={`${node.prev?.id}-${node.id}`}
          prev={node.prev?.id}
          node={node.definition}
        />
      );
    }

    let children = (
      <Row className={classNames({multi: nexts.length > 1})}>
        {nexts.map((next, index, array) => {
          return (
            <Fragment key={`${node.id}-${next.id}-${index}`}>
              <ConnectionLine
                node={node.id}
                next={next.id}
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
      <Node key={`${node.prev?.id}-${node.id}`} node={node}>
        {children}
      </Node>
    );
  }

  function renderFlow(flow: ProcedureFlow): ReactNode {
    return (
      <div className="flow" key={flow.definition.id}>
        {flow.starts.map(renderNode)}
      </div>
    );
  }

  return (
    <Wrapper ref={wrapperRef}>
      <EditorContext.Provider value={{editor}}>
        <Navigation onFullScreenToggle={onFullScreenToggle} />
        <Content>{renderFlow(editor.treeView)}</Content>
        {/* <Footer /> */}
      </EditorContext.Provider>
    </Wrapper>
  );
};
