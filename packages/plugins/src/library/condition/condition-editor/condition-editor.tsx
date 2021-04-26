import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {
  ConditionAndGroup,
  ConditionOrGroup,
  CustomConditionCandidate,
  CustomConditionRenderDefinition,
  defaultConditionRenderDefinition,
} from '../@custom-condition';

import {AddButton} from './@add-button';
import {ConditionContext} from './@context';
import {ConditionGroup} from './@group';

const Wrapper = styled.div`
  width: 680px;
  margin: 12px 60px;

  > .add {
    margin-left: 30px;
    margin-top: 16px;
  }
`;

interface ConditionEditorProps {
  renderDefinition?: CustomConditionRenderDefinition;
  leftCandidates?: CustomConditionCandidate[];
  rightCandidates?: CustomConditionCandidate[];
  conditions?: ConditionOrGroup;
  onChange?(conditionOrGroup: ConditionOrGroup): void;
}

const TextSeparator = styled.div`
  margin: 14px 0;
  font-size: 0.9em;
  line-height: 18px;
  text-align: center;

  color: #333333;
`;

export const ConditionEditor: FC<ConditionEditorProps> = ({
  renderDefinition,
  leftCandidates = [],
  rightCandidates = leftCandidates,
  conditions: orGroup = [[]],
  onChange,
}) => {
  renderDefinition = Object.assign(
    defaultConditionRenderDefinition,
    renderDefinition,
  );

  const onGroupChange = (index: number, group: ConditionAndGroup): void => {
    let nextConditions = [...orGroup];

    nextConditions.splice(index, 1, group);

    onChange?.(nextConditions);
  };

  const onAddOr = (): void => {
    onChange?.([...orGroup, []]);
  };

  return (
    <ConditionContext.Provider
      value={{renderDefinition, leftCandidates, rightCandidates}}
    >
      <Wrapper>
        {orGroup.map((andGroup, index) => (
          <Fragment key={index}>
            {index ? <TextSeparator>或</TextSeparator> : undefined}
            <ConditionGroup
              index={index}
              conditions={andGroup}
              onChange={onGroupChange}
            />
          </Fragment>
        ))}
        <AddButton onClick={onAddOr}>或条件</AddButton>
      </Wrapper>
    </ConditionContext.Provider>
  );
};
