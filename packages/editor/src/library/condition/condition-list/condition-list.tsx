import {Operant} from '@magicflow/condition';
import classNames from 'classnames';
import React, {FC} from 'react';
import styled from 'styled-components';

import {TextSeparator} from '../../components';
import {ConditionOrGroup} from '../@custom-condition';

const Wrapper = styled.div``;

const ConditionGroup = styled.div`
  .separator {
    margin: 8px 0;
  }
`;

const ConditionLine = styled.div`
  font-size: 12px;
  line-height: 15px;
  text-align: left;

  & + & {
    margin-top: 8px;
  }
`;

const DisplayText = styled.span`
  color: #333;
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
  operantCandidates?: CustomConditionOperantCandidate[];
}

export const ConditionList: FC<ConditionListProps> = ({
  className,
  conditions,
}) => {
  if (!conditions) {
    return <></>;
  }

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
                <DisplayText>{left.type}</DisplayText>
                <OperatorText>{operator}</OperatorText>
                <DisplayText>{right.type}</DisplayText>
              </ConditionLine>
            );
          })}
        </ConditionGroup>
      ))}
    </Wrapper>
  );
};
