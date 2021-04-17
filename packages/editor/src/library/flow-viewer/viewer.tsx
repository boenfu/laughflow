import {IPlugin} from '@magicflow/plugins';
import {Procedure, ProcedureDefinition} from '@magicflow/procedure';
import {Task, TaskMetadata, TaskRuntime} from '@magicflow/task';
import {useCreation} from 'ahooks';
import React, {FC, useRef} from 'react';
import styled from 'styled-components';

import {FlowContext} from '../flow-context';
import {ProcedureEditor} from '../procedure-editor';

import {Flow} from './flow';

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

export interface FlowViewerProps {
  definition: ProcedureDefinition;
  task: TaskMetadata;
  plugins?: IPlugin[];
}

export const FlowViewer: FC<FlowViewerProps> = ({
  definition,
  task: taskMetadata,
  plugins = [],
}) => {
  // eslint-disable-next-line no-null/no-null
  const wrapperRef = useRef<HTMLDivElement>(null);
  const task = useCreation(
    () =>
      new Task(
        new Procedure(definition),
        taskMetadata,
        new TaskRuntime(plugins.map(plugin => plugin.task)),
      ),
    [],
  );

  const editor = useCreation(
    () => new ProcedureEditor(definition, plugins),
    [],
  );

  return (
    <Wrapper ref={wrapperRef}>
      <FlowContext.Provider value={{type: 'viewer', task, editor}}>
        <Content>
          <Flow flow={task.procedure.treeView.root} />
        </Content>
      </FlowContext.Provider>
    </Wrapper>
  );
};
