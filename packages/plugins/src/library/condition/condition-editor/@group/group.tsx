import React, {FC} from 'react';
import styled from 'styled-components';

import {ConditionAndGroup, CustomCondition} from '../../@custom-condition';
import {AddButton} from '../@add-button';

import {ConditionLine} from './@line';

const Wrapper = styled.div`
  border: 1px dashed #dcdee3;
  box-sizing: border-box;
  border-radius: 2px;

  min-height: 48px;

  > .add {
    margin: 16px 30px;
  }
`;

interface ConditionGroupProps {
  index: number;
  conditions?: ConditionAndGroup;
  onChange?(index: number, conditions: ConditionAndGroup): void;
}

export const ConditionGroup: FC<ConditionGroupProps> = ({
  index,
  conditions = [],
  onChange,
}) => {
  const onLineChange = (
    lineIndex: number,
    condition: Partial<CustomCondition> | undefined,
  ): void => {
    let nextConditions = [...conditions];

    nextConditions.splice(
      lineIndex,
      1,
      ...(condition ? [condition as CustomCondition] : []),
    );

    onChange?.(index, nextConditions);
  };

  const onAddAnd = (): void => {
    onChange?.(index, [...conditions, {} as CustomCondition]);
  };

  return (
    <Wrapper>
      {conditions.map((condition, index) => (
        <ConditionLine
          key={index}
          index={index}
          condition={condition}
          onChange={onLineChange}
        />
      ))}

      <AddButton onClick={onAddAnd}>且条件</AddButton>
    </Wrapper>
  );
};
