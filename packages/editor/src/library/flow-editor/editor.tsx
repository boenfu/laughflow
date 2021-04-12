import {useCreation, useUpdate} from 'ahooks';
import React, {FC, useEffect, useRef} from 'react';
import styled from 'styled-components';

import {EditorContext} from '../context';
import {ProcedureEditor} from '../procedure-editor';

import {EditorProps as FlowEditorProps} from './editor.doc';
import {Flow} from './flow';

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

  // const onFullScreenToggle = (): void => {
  //   if (document.fullscreenElement) {
  //     void document.exitFullscreen();
  //   } else {
  //     void wrapperRef.current?.requestFullscreen();
  //   }

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
        <Content>
          <Flow flow={editor.treeView} />
        </Content>
      </EditorContext.Provider>
    </Wrapper>
  );
};
