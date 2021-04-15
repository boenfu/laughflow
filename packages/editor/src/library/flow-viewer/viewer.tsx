import {Procedure} from '@magicflow/procedure';
import {Task} from '@magicflow/task';
import {useCreation} from 'ahooks';
import React, {FC, useRef} from 'react';
import styled from 'styled-components';

import {ConditionPlugin} from '../condition';

import {Flow} from './@flow';
import {TaskContext, ViewerContext} from './task-context';
import {ViewerProps as FlowEditorProps} from './viewer.doc';

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

export const FlowViewer: FC<FlowEditorProps> = ({
  definition,
  metadata,
  plugins = [],
}) => {
  // eslint-disable-next-line no-null/no-null
  const wrapperRef = useRef<HTMLDivElement>(null);
  const task = useCreation(
    () =>
      new Task(
        new Procedure(definition),
        metadata,
        new TaskContext([
          ...plugins,
          // default
          new ConditionPlugin(),
        ]),
      ),
    [],
  );

  return (
    <Wrapper ref={wrapperRef}>
      <ViewerContext.Provider value={{task}}>
        <Content>
          <Flow flow={task.startFlow} start />
        </Content>
      </ViewerContext.Provider>
    </Wrapper>
  );
};
