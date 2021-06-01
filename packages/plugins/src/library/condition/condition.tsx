/* eslint-disable react-hooks/rules-of-hooks */
import {evaluate} from '@magicflow/condition';
import {ArrowDown} from '@magicflow/icons';
import {TaskNodeRuntimeMethodParams} from '@magicflow/task';
import React, {useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';

import {EditorRender, IPlugin, NodeEditorRender, ViewerRender} from '../plugin';

import {
  ConditionOrGroup,
  CustomCondition,
  CustomConditionCandidate,
} from './@custom-condition';
import {ConditionEditor} from './condition-editor';
import {ConditionList} from './condition-list';

declare global {
  namespace Magicflow {
    interface SingleNodeExtension {
      conditions?: {
        enter?: ConditionOrGroup;
        visible?: ConditionOrGroup;
        continue?: ConditionOrGroup;
        done?: ConditionOrGroup;
        terminate?: ConditionOrGroup;
      };
    }

    interface BranchesNodeExtension {
      conditions?: {
        enter?: ConditionOrGroup;
        visible?: ConditionOrGroup;
        continue?: ConditionOrGroup;
        done?: ConditionOrGroup;
        terminate?: ConditionOrGroup;
      };
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

export type ConditionVariableResolver = (
  variable: string,
  context?: TaskNodeRuntimeMethodParams,
) => any;

interface ConditionProps {
  mode: 'enter' | 'visible';
}

export class ConditionPlugin implements IPlugin<ConditionProps> {
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

  private singleNode: NodeEditorRender<ConditionProps> = {
    before: ({node, prevChildren}) => {
      let definition = node.definition;

      if (!definition.conditions?.enter?.length) {
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
            conditions={definition.conditions.enter}
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
          {definition.conditions?.visible?.length ? (
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
                conditions={definition.conditions.visible}
              />
            </NodeBodyWrapper>
          ) : undefined}
          {prevChildren}
        </>
      );
    },
    config: ({value: definition, onChange: onDefinitionChange, mode}) => {
      let conditionField: 'visible' | 'enter' =
        mode === 'enter' ? 'visible' : 'enter';

      const [editingDefinition, setDefinition] = useState(definition);

      useEffect(() => {
        onDefinitionChange?.(editingDefinition);
      }, [editingDefinition, onDefinitionChange]);

      const onChange = useCallback(
        conditions =>
          setDefinition({
            ...editingDefinition,
            conditions: {
              ...editingDefinition.conditions,
              [mode === 'enter' ? 'visible' : 'enter']: conditions,
            },
          }),
        [editingDefinition, mode, setDefinition],
      );

      return (
        <ConditionEditor
          leftCandidates={this.leftCandidates}
          rightCandidates={this.rightCandidates}
          conditions={editingDefinition.conditions?.[conditionField]}
          onChange={onChange}
        />
      );
    },
  };

  task: IPlugin['task'] = {
    nodeBroken: params => {
      let {definition} = params;

      if (!definition.conditions?.enter) {
        return false;
      }

      let condition = definition.conditions.enter.map(
        (andGroup): CustomCondition[] =>
          andGroup.filter(
            (condition): condition is CustomCondition =>
              !!(condition.left && condition.operator && condition.right),
          ),
      );

      return !evaluate(condition, name => this.resolver(name, params));
    },
    nodeIgnored: params => {
      let {definition} = params;

      if (!definition.conditions?.visible) {
        return false;
      }

      let condition = definition.conditions.visible.map(
        (andGroup): CustomCondition[] =>
          andGroup.filter(
            (condition): condition is CustomCondition =>
              !!(condition.left && condition.operator && condition.right),
          ),
      );

      return !evaluate(condition, name => this.resolver(name, params));
    },
  };

  get editor(): EditorRender<ConditionProps> {
    return {
      node: this.singleNode,
    };
  }

  get viewer(): ViewerRender {
    return {
      node: this.singleNode,
    };
  }

  constructor(
    private resolver: ConditionVariableResolver = (name, context): any =>
      context?.inputs?.[name],
  ) {}
}
