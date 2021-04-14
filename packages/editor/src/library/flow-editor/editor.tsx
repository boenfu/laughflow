import {FlowId, NodeId} from '@magicflow/core';
import {addFlowStart, addNodeNexts} from '@magicflow/procedure/operators';
import {useCreation, useUpdate} from 'ahooks';
import React, {FC, MouseEvent, useEffect, useRef} from 'react';
import styled from 'styled-components';

import {ConditionPlugin} from '../condition';
import {EditorContext} from '../context';
import {ActiveIdentity, ProcedureEditor} from '../procedure-editor';

import {Footer} from './@footer';
import {Navigation} from './@navigation';
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

  * {
    pointer-events: none;
  }
`;

export const FlowEditor: FC<FlowEditorProps> = ({
  definition,
  plugins = [],
  onConfig,
}) => {
  // eslint-disable-next-line no-null/no-null
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editor = useCreation(
    () =>
      new ProcedureEditor(definition, [
        ...plugins,
        // default
        new ConditionPlugin(),
      ]),
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

  const onContentClick = (event: MouseEvent): void => {
    let elem = event.target as HTMLElement;

    while (elem && !elem.dataset?.['id']) {
      elem = elem.parentNode as HTMLElement;
    }

    if (!elem) {
      editor.active();
      return;
    }

    let id = String(elem.dataset['id']);
    let prev = elem.dataset['prev'] && String(elem.dataset['prev']);

    let activeInfo = editor.activeInfo;

    if (activeInfo?.value.type !== 'flow' && activeInfo?.state === 'connect') {
      editor.edit(
        prev
          ? addNodeNexts(id as NodeId, [activeInfo.value.id])
          : addFlowStart(id as FlowId, activeInfo.value.id),
      );
      editor.active();
      return;
    }

    editor.active((prev ? {prev, node: id} : {flow: id}) as ActiveIdentity);
  };

  useEffect(() => {
    editor.on('update', () => reRender());

    if (onConfig) {
      editor.on('config', onConfig);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Wrapper ref={wrapperRef}>
      <EditorContext.Provider value={{editor}}>
        <Navigation onFullScreenToggle={onFullScreenToggle} />
        <Content onClick={onContentClick}>
          <Flow flow={editor.rootFlow} start />
        </Content>
        <Footer />
      </EditorContext.Provider>
    </Wrapper>
  );
};
