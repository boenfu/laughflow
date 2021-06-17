import {Operant, getOperatorDisplayName} from '@magicflow/condition';
import classNames from 'classnames';
import React, {FC} from 'react';
import styled from 'styled-components';

import {TextSeparator} from '../@common';
import {ConditionOrGroup, CustomConditionCandidate} from '../@custom-condition';

const Wrapper = styled.div``;

const ConditionGroup = styled.div`
  .separator {
    margin: 8px 0;
  }
`;

const ConditionLine = styled.div`
  font-size: 0.8em;
  line-height: 15px;
  text-align: left;
  white-space: break-spaces;

  & + & {
    margin-top: 8px;
  }
`;

const DisplayText = styled.span`
  color: #333;
`;

const VariableText = styled.span`
  color: #296dff;
`;

const OperatorText = styled.span`
  color: #999;
  padding: 0 3px;
`;

export interface CustomConditionOperantCandidate {
  name: string;
  displayName: string;
  operant: Operant;
}

export interface ConditionListProps {
  className?: string;
  conditions?: ConditionOrGroup;
  leftCandidates?: CustomConditionCandidate[];
  rightCandidates?: CustomConditionCandidate[];
}

export const ConditionList: FC<ConditionListProps> = ({
  className,
  conditions,
  leftCandidates = [],
  rightCandidates = leftCandidates,
}) => {
  if (!conditions) {
    return <></>;
  }

  let leftCandidatesKeyToDisplayNameMap = new Map(
    leftCandidates.map(({operant, displayName}) => [
      `${operant.type}:${
        'value' in operant ? operant.value : operant.variable
      }`,
      displayName,
    ]),
  );

  let rightCandidatesKeyToDisplayNameMap = new Map(
    rightCandidates.map(({operant, displayName}) => [
      `${operant.type}:${
        'value' in operant ? operant.value : operant.variable
      }`,
      displayName,
    ]),
  );

  return (
    <Wrapper className={classNames('condition-list', className)}>
      {conditions.map((orGroup, index) => (
        <ConditionGroup key={index}>
          {index ? (
            <TextSeparator className="separator">或</TextSeparator>
          ) : undefined}

          {orGroup.map(({left, right, operator}, conditionIndex) => {
            return (
              <ConditionLine key={conditionIndex}>
                <DisplayText>
                  {left &&
                    (leftCandidatesKeyToDisplayNameMap.get(
                      `${left.type}:${
                        'value' in left ? left.value : left.variable
                      }`,
                    ) ||
                      ('value' in left ? (
                        String(left.value)
                      ) : (
                        <VariableText>{left.variable}</VariableText>
                      )))}
                </DisplayText>
                <OperatorText>
                  {operator && getOperatorDisplayName(operator)}
                </OperatorText>
                <DisplayText>
                  {right &&
                    (rightCandidatesKeyToDisplayNameMap.get(
                      `${right.type}:${
                        'value' in right ? right.value : right.variable
                      }`,
                    ) ||
                      ('value' in right ? (
                        String(right.value)
                      ) : (
                        <VariableText>{right.variable}</VariableText>
                      )))}
                </DisplayText>
              </ConditionLine>
            );
          })}
        </ConditionGroup>
      ))}
    </Wrapper>
  );
};
