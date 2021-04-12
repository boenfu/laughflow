import {ProcedureFlow} from '@magicflow/procedure';
import {useCreation, useUpdate} from 'ahooks';
import React, {FC, ReactNode, useEffect, useRef} from 'react';
import styled from 'styled-components';

// import {ConditionPlugin} from '../condition';
import {EditorContext} from '../context';
import {ProcedureEditor} from '../procedure-editor';

// import {Footer} from './@footer';
import {Navigation} from './@navigation';
import {LINE_HEIGHT_DEFAULT} from './connection-line';
import {EditorProps as FlowEditorProps} from './editor.doc';
import {Flow} from './flow';
import {Node} from './node';

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

  return (
    <Wrapper ref={wrapperRef}>
      <EditorContext.Provider value={{editor}}>
        <Navigation onFullScreenToggle={onFullScreenToggle} />
        <Content>
          <Flow flow={editor.treeView} />
        </Content>
        {/* <Footer /> */}
      </EditorContext.Provider>
    </Wrapper>
  );
};
