import type {OperatorDefinition, VariableOperant} from '@laughflow/condition';
import {listOperatorDefinitionsForLeftOperantOfType} from '@laughflow/condition';
import {Exchange, Wrong} from '@laughflow/icons';
import {isEqual} from 'lodash-es';
import type {FC} from 'react';
import React, {useContext, useState} from 'react';
import Select from 'react-select';
import styled from 'styled-components';

import type {
  CustomCondition,
  CustomConditionCandidate,
  CustomOperant,
} from '../../../@custom-condition';
import {ConditionContext} from '../../@context';

const Input = styled.input`
  box-sizing: border-box;
  border: 1px solid #ccc;
  outline: none;
  border-radius: 4px;
  text-indent: 10px;
  height: 38px;
`;
const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  margin: 20px 0 0 20px;

  & + & {
    margin-top: 10px;
  }

  .variable-select {
    width: 186px;
    font-size: 0.9em;
  }

  .operator-select {
    width: 110px;
    font-size: 0.9em;
    margin: 0 10px;
  }

  .value-select {
    width: 312px;
    font-size: 0.9em;
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

const RightModeWrapper = styled.div`
  position: absolute;
  top: 1px;
  right: 42px;
  height: calc(100% - 2px);
  display: flex;
  align-items: center;
  font-size: 0.8em;

  background-color: #fff;
  color: #999;

  cursor: pointer;

  transition: color 0.2s linear;

  &:hover {
    color: #296dff;
  }

  > svg {
    font-size: 1em;
  }
`;

interface ConditionLineProps {
  index: number;
  condition?: Partial<CustomCondition>;
  onChange?(
    index: number,
    condition: Partial<CustomCondition> | undefined,
  ): void;
}

const RightMode: FC<{
  operant: CustomOperant | undefined;
  onChange(operant: CustomOperant | undefined): void;
}> = ({operant, onChange}) => {
  const onClick = (): void => {
    if (operant && 'variable' in operant) {
      onChange(undefined);
    } else {
      onChange({type: 'unknown', variable: ''});
    }
  };

  return (
    <RightModeWrapper onClick={onClick}>
      {operant && 'variable' in operant ? '变量' : '固定值'}
      <Exchange />
    </RightModeWrapper>
  );
};

export const ConditionLine: FC<ConditionLineProps> = ({
  index,
  condition,
  onChange,
}) => {
  let {leftCandidates, rightCandidates} = useContext(ConditionContext);

  let operatorDefinitions = condition?.left?.type
    ? listOperatorDefinitionsForLeftOperantOfType(condition.left.type)
    : [];

  let [leftEditing, setLeftEditing] = useState(false);
  let [rightEditing, setRightEditing] = useState(true);

  let filteredRightConditionCandidate = [
    ...(rightCandidates?.filter(candidate =>
      condition?.left?.renderType
        ? condition.left.renderType === candidate.operant.renderType
        : condition?.left?.type === candidate.operant.type,
    ) || []),
    {
      name: 'custom',
      displayName: '自定义变量',
    } as CustomConditionCandidate,
  ];

  const onLeftChange = ({operant}: CustomConditionCandidate): void => {
    // custom variable
    if (!operant) {
      setLeftEditing(true);
      return;
    }

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
    // custom variable
    if (!operant) {
      setRightEditing(true);
      return;
    }

    onChange?.(index, {
      ...condition,
      right: operant,
    });
  };

  const onRightModeChange = (operant: CustomOperant | undefined): void => {
    onChange?.(index, {
      ...condition,
      right: operant,
    });
  };

  const onDeleteLine = (): void => {
    onChange?.(index, undefined);
  };

  let selectedLeftCandidate = leftCandidates?.find(candidate =>
    isEqual(candidate.operant, condition?.left),
  );

  let isCustomVariableLeft =
    leftEditing || !!(condition?.left && !selectedLeftCandidate);

  let selectedRightCandidate = rightCandidates?.find(candidate =>
    isEqual(candidate.operant, condition?.right),
  );

  let isVariableRight = !!(condition?.right && 'variable' in condition.right);

  let isCustomVariableRight =
    rightEditing ||
    !!(
      isVariableRight &&
      (condition?.right as VariableOperant)?.variable &&
      !selectedRightCandidate
    );

  return (
    <Wrapper>
      {isCustomVariableLeft ? (
        <Input
          className="variable-select"
          placeholder="请输入"
          value={(condition?.left as any)?.variable || ''}
          onBlur={() => setLeftEditing(false)}
          onChange={event => {
            onChange?.(index, {
              ...condition,
              left: {type: 'unknown', variable: event.target.value},
            });
          }}
          autoFocus={leftEditing}
        />
      ) : (
        <Select<CustomConditionCandidate>
          className="variable-select"
          value={selectedLeftCandidate}
          options={[
            ...(leftCandidates || []),
            {
              name: 'custom',
              displayName: '自定义变量',
            } as CustomConditionCandidate,
          ]}
          getOptionLabel={option => option.displayName}
          getOptionValue={option => option.name}
          placeholder="请选择"
          components={{IndicatorSeparator: undefined}}
          isSearchable={false}
          onChange={onLeftChange}
          noOptionsMessage={() => ''}
        />
      )}

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
        noOptionsMessage={() => ''}
      />

      {isVariableRight ? (
        isCustomVariableRight ? (
          <Input
            className="value-select"
            placeholder="请输入"
            value={(condition?.right as any)?.variable || ''}
            onBlur={() => setRightEditing(false)}
            onChange={event => {
              onChange?.(index, {
                ...condition,
                right: {type: 'unknown', variable: event.target.value},
              });
            }}
            autoFocus={rightEditing}
          />
        ) : (
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
            components={{
              IndicatorSeparator: undefined,
              IndicatorsContainer: () => <></>,
            }}
            onChange={onRightChange}
            noOptionsMessage={() => ''}
          />
        )
      ) : (
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
          components={{
            IndicatorSeparator: undefined,
            IndicatorsContainer: () => <></>,
          }}
          onChange={onRightChange}
          noOptionsMessage={() => ''}
        />
      )}

      <RightMode operant={condition?.right} onChange={onRightModeChange} />

      <DeleteIcon onClick={onDeleteLine}>
        <Wrong />
      </DeleteIcon>
    </Wrapper>
  );
};
