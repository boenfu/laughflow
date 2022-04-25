import {groupBy, isEqual} from 'lodash-es';

export type OperatorName =
  | '='
  | '!='
  | '<'
  | '>'
  | '<='
  | '>='
  | 'in'
  | '!in'
  | 'includes'
  | '!includes';

export type Type =
  | 'unknown'
  | 'string'
  | 'string[]'
  | 'number'
  | 'number[]'
  | 'boolean'
  | 'boolean[]'
  | 'object'
  | 'object[]';

export interface OperatorDefinition {
  name: OperatorName;
  displayName: string;
  left: Type;
  right: Type;
  compare(x: any, y: any): boolean;
}

type CommonOperatorDefinition = Omit<
  OperatorDefinition,
  'left' | 'right' | 'name'
>;

export const commonOperatorDefinitionDict: {
  [TOperatorName in OperatorName]: CommonOperatorDefinition;
} = {
  '=': {
    displayName: '等于',
    compare(x, y) {
      return isEqual(x, y);
    },
  },
  '!=': {
    displayName: '不等于',
    compare(x, y) {
      return !isEqual(x, y);
    },
  },
  '<': {
    displayName: '小于',
    compare(x: any, y: any) {
      return x < y;
    },
  },
  '>': {
    displayName: '大于',
    compare(x: any, y: any) {
      return x > y;
    },
  },
  '<=': {
    displayName: '小于等于',
    compare(x: any, y: any) {
      return x <= y;
    },
  },
  '>=': {
    displayName: '大于等于',
    compare(x: any, y: any) {
      return x >= y;
    },
  },
  in: {
    displayName: '包含于',
    compare(x, y) {
      return Array.isArray(y) && y.some(value => isEqual(value, x));
    },
  },
  '!in': {
    displayName: '不包含于',
    compare(x, y) {
      return Array.isArray(y) && !y.some(value => isEqual(value, x));
    },
  },
  includes: {
    displayName: '包含',
    compare(x, y) {
      return includes(x, y);
    },
  },
  '!includes': {
    displayName: '不包含',
    compare(x, y) {
      return !includes(x, y);
    },
  },
};

const equalityOperatorNames: OperatorName[] = ['=', '!='];

const relationalOperatorNames: OperatorName[] = ['>', '<', '>=', '<='];

const inOperatorNames: OperatorName[] = ['in', '!in'];

const includesOperatorNames: OperatorName[] = ['includes', '!includes'];

export const operatorDefinitions: OperatorDefinition[] = [
  // unknown
  ...generateOperators('unknown', 'unknown', [
    ...equalityOperatorNames,
    ...relationalOperatorNames,
    ...inOperatorNames,
    ...includesOperatorNames,
  ]),

  // string
  ...generateOperators('string', 'string', [
    ...equalityOperatorNames,
    ...relationalOperatorNames,
    ...includesOperatorNames,
  ]),
  ...generateOperators('string', 'string[]', inOperatorNames),
  ...generateOperators('string[]', 'string', includesOperatorNames),

  // number
  ...generateOperators('number', 'number', [
    ...equalityOperatorNames,
    ...relationalOperatorNames,
  ]),
  ...generateOperators('number', 'number[]', inOperatorNames),
  ...generateOperators('number[]', 'number', includesOperatorNames),

  // boolean
  ...generateOperators('boolean', 'boolean', equalityOperatorNames),
  ...generateOperators('boolean', 'boolean[]', inOperatorNames),
  ...generateOperators('boolean[]', 'boolean', includesOperatorNames),

  // object
  ...generateOperators('object', 'object', equalityOperatorNames),
  ...generateOperators('object', 'object[]', inOperatorNames),
  ...generateOperators('object[]', 'object', includesOperatorNames),
];

function generateOperators(
  left: Type,
  right: Type,
  names: OperatorName[],
): OperatorDefinition[] {
  return names.map((name): OperatorDefinition => {
    return {
      name,
      left,
      right,
      ...commonOperatorDefinitionDict[name],
    };
  });
}

function includes(leftValue: any, rightValue: any): boolean {
  if (typeof leftValue === 'string') {
    return leftValue.includes(String(rightValue));
  } else if (Array.isArray(leftValue)) {
    if (Array.isArray(rightValue)) {
      return rightValue.every(rightItem =>
        leftValue.some(leftItem => isEqual(rightItem, leftItem)),
      );
    } else {
      return leftValue.some(leftItem => isEqual(leftItem, rightValue));
    }
  } else {
    return false;
  }
}

export const leftTypeToOperatorNameToRightTypeToOperatorDefinitionMapMapMap =
  new Map(
    Object.entries(
      groupBy(operatorDefinitions, definition => definition.left),
    ).map(([left, definitions]: [Type, OperatorDefinition[]]) => [
      left,
      new Map(
        Object.entries(groupBy(definitions, definition => definition.name)).map(
          ([name, definitions]: [OperatorName, OperatorDefinition[]]) => [
            name,
            new Map(
              definitions.map(definition => [definition.right, definition]),
            ),
          ],
        ),
      ),
    ]),
  );

export function listOperatorDefinitionsForLeftOperantOfType(
  type: Type,
): OperatorDefinition[] {
  let operatorNameToRightTypeToOperatorDefinitionMapMap =
    leftTypeToOperatorNameToRightTypeToOperatorDefinitionMapMapMap.get(type);

  if (!operatorNameToRightTypeToOperatorDefinitionMapMap) {
    return [];
  }

  return Array.from(
    operatorNameToRightTypeToOperatorDefinitionMapMap.values(),
    rightTypeToOperatorDefinitionMap =>
      rightTypeToOperatorDefinitionMap.values().next().value,
  );
}

export function getRightOperantType(
  left: Type,
  operator: OperatorName,
): Type | undefined {
  let operatorNameToRightTypeToOperatorDefinitionMapMap =
    leftTypeToOperatorNameToRightTypeToOperatorDefinitionMapMapMap.get(left);

  let rightTypeToOperatorDefinitionMap =
    operatorNameToRightTypeToOperatorDefinitionMapMap &&
    operatorNameToRightTypeToOperatorDefinitionMapMap.get(operator);

  if (!rightTypeToOperatorDefinitionMap) {
    return undefined;
  }

  let [definition] = rightTypeToOperatorDefinitionMap.values();

  return definition && definition.right;
}

export function getOperatorDisplayName(operator: OperatorName): string {
  return commonOperatorDefinitionDict[operator].displayName;
}
