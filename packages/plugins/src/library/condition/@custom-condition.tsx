import {Condition, Operant} from '@laughflow/condition';
import React, {FC} from 'react';

export type CustomOperant = Operant & {
  /**
   * default is `type`
   */
  renderType?: string;
};

export interface CustomCondition extends Condition {
  left: CustomOperant;
  right: CustomOperant;
}

export type ConditionAndGroup = Partial<CustomCondition>[];
export type ConditionOrGroup = ConditionAndGroup[];

export interface CustomConditionCandidate {
  name: string;
  displayName: string;
  operant: CustomOperant;
}

export type CustomConditionRender<TValue = any> = FC<{
  value: TValue;
  onChange(newValue: TValue | undefined): void;
}>;

export interface CustomConditionRenderDefinition {
  [TRenderType: string]: CustomConditionRender;
}

export const defaultConditionRenderDefinition: CustomConditionRenderDefinition = {
  string: ({value, onChange}) => (
    <input
      type="text"
      value={value}
      onChange={event => onChange(event.target.value)}
    />
  ),
};
