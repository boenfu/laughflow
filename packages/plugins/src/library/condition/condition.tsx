import {evaluate} from '@magicflow/condition';
import {ArrowDown} from '@magicflow/icons';
import {TaskNodeRuntimeMethodParams} from '@magicflow/task';
import React from 'react';
import styled from 'styled-components';

import {EditorRender, IPlugin, NodeEditorRender, ViewerRender} from '../plugin';

import {ConditionOrGroup, CustomConditionCandidate} from './@custom-condition';
import {ConditionEditor} from './condition-editor';
import {ConditionList} from './condition-list';

declare global {
  namespace Magicflow {
    interface SingleNodeExtension {
      enterConditions?: ConditionOrGroup;
      visibleConditions?: ConditionOrGroup;
    }

    interface BranchesNodeExtension {
      enterConditions?: ConditionOrGroup;
      visibleConditions?: ConditionOrGroup;
    }
  }
}

const NodeBeforeWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;

  > .condition-list {
    width: 220px;
    padding: 16px 14px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
    border-radius: 4px;
    overflow: hidden;
    background-color: #ffffff;
    cursor: pointer;

    transition: box-shadow 0.2s linear;

    &:hover {
      box-shadow: 0px 6px 12px rgba(58, 69, 92, 0.16);
    }
  }
`;

const NodeBodyWrapper = styled.div`
  > .condition-list {
    padding: 8px 16px;
  }
`;

const ConditionName = styled.div`
  font-size: 0.8em;
  line-height: 15px;
  padding-left: 16px;
  padding-top: 14px;
  text-align: left;

  color: #666666;
`;

const ConnectArrow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 22px;
  height: 22px;
  left: 50%;
  bottom: -16px;
  border-radius: 50%;
  transform: translate(-50%, 0);

  background-color: #5e91ff;
  border: 1px solid #ffffff;
  color: #ffffff;

  z-index: 2;
`;

export type IConditionPlugin = IPlugin<{
  mode: 'enter' | 'visible';
}>;

export type ConditionVariableResolver = (
  variable: string,
  context?: TaskNodeRuntimeMethodParams,
) => any;

export class ConditionPlugin implements IConditionPlugin {
  readonly name = 'condition';

  private leftCandidates: CustomConditionCandidate[] = [
    {
      name: 'username',
      displayName: '用户名',
      operant: {
        type: 'object',
        value: '啊哈',
      },
    },
  ];

  private rightCandidates: CustomConditionCandidate[] = [];

  private singleNode: NodeEditorRender = {
    before: ({node, prevChildren}) => {
      let definition = node.definition;

      if (!definition.enterConditions?.length) {
        return <>{prevChildren}</>;
      }

      return (
        <NodeBeforeWrapper
          onClick={event => {
            event.stopPropagation();
            // editor.emitConfig(node, 'enter');
          }}
        >
          <ConditionList
            leftCandidates={this.leftCandidates}
            rightCandidates={this.rightCandidates}
            conditions={definition.enterConditions}
          />
          <ConnectArrow>
            <ArrowDown />
          </ConnectArrow>
        </NodeBeforeWrapper>
      );
    },
    body: ({node, prevChildren}) => {
      let definition = node.definition;

      return (
        <>
          {definition.visibleConditions?.length ? (
            <NodeBodyWrapper
              onClick={event => {
                event.stopPropagation();
                // editor.emitConfig(node, 'visible');
              }}
            >
              <ConditionName>展示条件</ConditionName>
              <ConditionList
                leftCandidates={this.leftCandidates}
                rightCandidates={this.rightCandidates}
                conditions={definition.visibleConditions}
              />
            </NodeBodyWrapper>
          ) : undefined}
          {prevChildren}
        </>
      );
    },
    config: ({value: definition, onChange, mode}) => {
      let conditionField: keyof typeof definition =
        mode === 'enter' ? 'visibleConditions' : 'enterConditions';

      return (
        <ConditionEditor
          leftCandidates={this.leftCandidates}
          rightCandidates={this.rightCandidates}
          conditions={definition[conditionField]}
          onChange={conditions =>
            onChange?.({...definition, [conditionField]: conditions})
          }
        />
      );
    },
  };

  task: IPlugin['task'] = {
    nodeBroken: params => {
      let {definition} = params;

      if (!definition.enterConditions) {
        return false;
      }

      return !evaluate(definition.enterConditions, name =>
        this.resolver(name, params),
      );
    },
    nodeIgnored: params => {
      let {definition} = params;

      if (!definition.visibleConditions) {
        return false;
      }

      return !evaluate(definition.visibleConditions, name =>
        this.resolver(name, params),
      );
    },
  };

  get editor(): EditorRender {
    let singleNode = this.singleNode;

    return {
      node: singleNode,
    };
  }

  get viewer(): ViewerRender {
    let singleNode = this.singleNode;

    return {
      node: singleNode,
    };
  }

  constructor(
    private resolver: ConditionVariableResolver = (name, context): any =>
      context?.inputs?.[name],
  ) {}
}
