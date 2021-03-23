import {
  OperatorDefinition,
  listOperatorDefinitionsForLeftOperantOfType,
} from '@magicflow/condition';
import {Wrong} from '@magicflow/icons';
import {isEqual} from 'lodash-es';
import React, {FC, useContext, useState} from 'react';
import Select from 'react-select';
import styled from 'styled-components';

import {
  CustomCondition,
  CustomConditionCandidate,
} from '../../../@custom-condition';
import {ConditionContext} from '../../@context';

const Wrapper = styled.div`
  display: flex;
  align-items: center;

  padding: 20px 0 0 20px;

  .variable-select {
    width: 186px;
    min-height: 40px;
    font-size: 14px;
  }

  .operator-select {
    width: 110px;
    min-height: 40px;
    font-size: 14px;
    margin: 0 10px;
  }

  .value-select {
    width: 312px;
    min-height: 40px;
    font-size: 14px;
  }
`;

const DeleteIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-left: 5px;
  cursor: pointer;

  color: #999;
`;

interface ConditionLineProps {
  index: number;
  condition?: Partial<CustomCondition>;
  onChange?(
    index: number,
    condition: Partial<CustomCondition> | undefined,
  ): void;
}

export const ConditionLine: FC<ConditionLineProps> = ({
  index,
  condition,
  onChange,
}) => {
  let {leftCandidates, rightCandidates} = useContext(ConditionContext);

  let [operatorDefinitions, setOperatorDefinitions] = useState<
    OperatorDefinition[]
  >([]);

  let filteredRightConditionCandidate = rightCandidates?.filter(candidate =>
    condition?.left?.renderType
      ? condition.left.renderType === candidate.operant.renderType
      : condition?.left?.type === candidate.operant.type,
  );

  const onLeftChange = ({operant}: CustomConditionCandidate): void => {
    setOperatorDefinitions(
      listOperatorDefinitionsForLeftOperantOfType(operant.type),
    );

    onChange?.(index, {
      ...condition,
      left: operant,
    });
  };

  const onOperatorChange = ({name}: OperatorDefinition): void => {
    onChange?.(index, {
      ...condition,
      operator: name,
    });
  };

  const onRightChange = ({operant}: CustomConditionCandidate): void => {
    onChange?.(index, {
      ...condition,
      right: operant,
    });
  };

  const onDeleteLine = (): void => {
    onChange?.(index, undefined);
  };

  return (
    <Wrapper>
      <Select<CustomConditionCandidate>
        className="variable-select"
        value={leftCandidates?.find(candidate =>
          isEqual(candidate.operant, condition?.left),
        )}
        options={leftCandidates}
        getOptionLabel={option => option.displayName}
        getOptionValue={option => option.name}
        placeholder="请选择"
        components={{IndicatorSeparator: undefined}}
        isSearchable={false}
        onChange={onLeftChange}
      />

      <Select<OperatorDefinition>
        className="operator-select"
        value={operatorDefinitions?.find(
          operator => operator.name === condition?.operator,
        )}
        options={operatorDefinitions}
        getOptionLabel={option => option.displayName}
        getOptionValue={option => option.name}
        placeholder="请选择"
        isSearchable={false}
        components={{IndicatorSeparator: undefined}}
        onChange={onOperatorChange}
      />

      <Select<CustomConditionCandidate>
        className="value-select"
        value={filteredRightConditionCandidate?.find(candidate =>
          isEqual(candidate.operant, condition?.right),
        )}
        options={filteredRightConditionCandidate}
        getOptionLabel={option => option.displayName}
        getOptionValue={option => option.name}
        placeholder="请选择"
        isSearchable={false}
        components={{IndicatorSeparator: undefined}}
        onChange={onRightChange}
      />

      <DeleteIcon onClick={onDeleteLine}>
        <Wrong />
      </DeleteIcon>
    </Wrapper>
  );
};
