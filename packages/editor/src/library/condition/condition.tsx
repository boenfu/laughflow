import {ArrowDown} from '@magicflow/icons';
import React from 'react';
import styled from 'styled-components';

import {transition} from '../components';
import {INodePlugin, IPlugin} from '../plugin';

import {ConditionOrGroup, CustomConditionCandidate} from './@custom-condition';
import {ConditionEditor} from './condition-editor';
import {ConditionList} from './condition-list';

declare global {
  namespace Magicflow {
    interface SingleNodeExtension {
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

    ${transition(['box-shadow'])}

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
  font-size: 12px;
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

export class ConditionPlugin implements IPlugin {
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

  node: INodePlugin<{mode: 'enter' | 'visible'}> = {
    render: {
      before: ({node, editor, prevChildren}) => {
        if (!node.enterConditions?.length) {
          return <>{prevChildren}</>;
        }

        return (
          <NodeBeforeWrapper
            onClick={event => {
              event.stopPropagation();
              editor.emitConfig({type: 'node', id: node.id}, 'enter');
            }}
          >
            <ConditionList
              leftCandidates={this.leftCandidates}
              rightCandidates={this.rightCandidates}
              conditions={node.enterConditions}
            />
            <ConnectArrow>
              <ArrowDown />
            </ConnectArrow>
          </NodeBeforeWrapper>
        );
      },
      body: ({node, editor, prevChildren}) => {
        return (
          <>
            {node.visibleConditions?.length ? (
              <NodeBodyWrapper
                onClick={event => {
                  event.stopPropagation();
                  editor.emitConfig({type: 'node', id: node.id}, 'visible');
                }}
              >
                <ConditionName>展示条件</ConditionName>
                <ConditionList
                  leftCandidates={this.leftCandidates}
                  rightCandidates={this.rightCandidates}
                  conditions={node.visibleConditions}
                />
              </NodeBodyWrapper>
            ) : undefined}
            {prevChildren}
          </>
        );
      },
      config: ({mode, node, onChange}) => {
        let conditionField: keyof typeof node =
          mode === 'enter' ? 'visibleConditions' : 'enterConditions';

        return (
          <ConditionEditor
            leftCandidates={this.leftCandidates}
            rightCandidates={this.rightCandidates}
            conditions={node[conditionField]}
            onChange={conditions =>
              onChange?.({...node, [conditionField]: conditions})
            }
          />
        );
      },
    },
    onUpdate({nextNode: node}) {
      const conditionFields = ['visibleConditions', 'enterConditions'] as const;

      for (let key of conditionFields) {
        if (!node[key]) {
          continue;
        }

        let conditions: ConditionOrGroup = [];

        for (let group of node[key] || []) {
          group = group.filter(
            condition =>
              !!(condition.left && condition.operator && condition.right),
          );

          if (group.length) {
            conditions.push(group);
          }
        }

        if (!conditions.length) {
          node[key] = undefined;
          continue;
        }

        node[key] = conditions;
      }
    },
  };
}
