import {IPlugin} from '@magicflow/plugins';
import {ProcedureDefinition} from '@magicflow/procedure';
import {TaskMetadata} from '@magicflow/task';
import {useCreation} from 'ahooks';
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
  plugins?: IPlugin[];
  task?: TaskMetadata;
}

export const FlowViewer = forwardRef<ProcedureViewer, FlowViewerProps>(
  ({definition, task, plugins = []}, ref) => {
    const viewer = useCreation(
      () => new ProcedureViewer(definition, plugins, task),
      [definition, task, plugins],
    );

    useImperativeHandle(ref, () => viewer);

    return (
      <Wrapper>
        <FlowContext.Provider value={{context: 'viewer', viewer}}>
          <Content>
            <Flow flow={viewer.rootFlow} taskFlow={viewer.task?.startFlow} />
          </Content>
        </FlowContext.Provider>
      </Wrapper>
    );
  },
);
