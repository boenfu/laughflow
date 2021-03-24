import {ArrowDown} from '@magicflow/icons';
import React from 'react';
import styled from 'styled-components';

import {transition} from '../components';
import {INodePlugin, IPlugin} from '../plugin';

import {CustomCondition, CustomConditionCandidate} from './@custom-condition';
import {ConditionEditor} from './condition-editor';
import {ConditionList} from './condition-list';

declare global {
  namespace Magicflow {
    interface NodeMetadataExtension {
      conditions?: CustomCondition[][];
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

  node: INodePlugin = {
    render: {
      before: ({node, prevChildren}) => {
        if (!node.conditions?.length) {
          return <>{prevChildren}</>;
        }

        return (
          <NodeBeforeWrapper>
            <ConditionList conditions={node.conditions} />
            <ConnectArrow>
              <ArrowDown />
            </ConnectArrow>
          </NodeBeforeWrapper>
        );
      },
      body: ({node, prevChildren}) => {
        return (
          <>
            {node.conditions?.length ? (
              <NodeBodyWrapper>
                <ConditionName>展示条件</ConditionName>
                <ConditionList conditions={node.conditions} />
              </NodeBodyWrapper>
            ) : undefined}
            {prevChildren}
          </>
        );
      },
      config: ({node, onChange}) => {
        return (
          <ConditionEditor
            leftCandidates={this.leftCandidates}
            rightCandidates={this.rightCandidates}
            conditions={node.conditions}
            onChange={conditions => onChange?.({...node, conditions})}
          />
        );
      },
    },
  };
}
