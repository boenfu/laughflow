import {IPlugin} from '@magicflow/plugins';
import {Procedure, ProcedureDefinition} from '@magicflow/procedure';
import {Task, TaskMetadata, TaskRuntime} from '@magicflow/task';
import {useCreation} from 'ahooks';
import {compact} from 'lodash-es';
import React, {forwardRef, useImperativeHandle} from 'react';
import styled from 'styled-components';

import {FlowContext} from '../flow-context';
import {ProcedureViewer} from '../procedure-viewer';

import {Flow} from './@flow';

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

export interface FlowViewerProps {
  definition: ProcedureDefinition;
  task?: TaskMetadata;
  plugins?: IPlugin[];
}

export const FlowViewer = forwardRef<ProcedureViewer, FlowViewerProps>(
  ({definition, task: taskMetadata, plugins = []}, ref) => {
    const task = useCreation(
      () =>
        taskMetadata &&
        new Task(
          new Procedure(definition),
          taskMetadata,
          new TaskRuntime(compact(plugins.map(plugin => plugin.task))),
        ),
      [definition],
    );

    const viewer = useCreation(() => new ProcedureViewer(definition, plugins), [
      definition,
    ]);

    useImperativeHandle(ref, () => viewer);

    return (
      <Wrapper>
        <FlowContext.Provider value={{context: 'viewer', task, viewer}}>
          <Content>
            <Flow flow={viewer.rootFlow} />
          </Content>
        </FlowContext.Provider>
      </Wrapper>
    );
  },
);
