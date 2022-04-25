import type {FlattenSimpleInterpolation} from 'styled-components';
import {css} from 'styled-components';

type AllowedTransition =
  | 'border-color'
  | 'background-color'
  | 'color'
  | 'filter'
  | 'transform'
  | 'opacity'
  | 'box-shadow';

export function transition(
  props: AllowedTransition[],
): FlattenSimpleInterpolation {
  return css`
    transition: ${props.map(prop => `${prop} 0.2s linear`).join(',')};
  `;
}
