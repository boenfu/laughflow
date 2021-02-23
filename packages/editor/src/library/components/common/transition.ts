import {FlattenSimpleInterpolation, css} from 'styled-components';

type AllowedTransition = 'background-color' | 'color' | 'filter' | 'transform' | 'opacity';

export function transition(
  props: AllowedTransition[],
): FlattenSimpleInterpolation {
  return css`
    transition: ${props.map(prop => `${prop} 0.2s linear`).join(',')};
  `;
}
