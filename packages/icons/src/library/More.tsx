import * as React from 'react';
import {SVGProps} from 'react';

const SvgMore = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M1.85 3.9a.65.65 0 0 1 .65-.65h11a.65.65 0 1 1 0 1.3h-11a.65.65 0 0 1-.65-.65ZM1.85 8a.65.65 0 0 1 .65-.65h11a.65.65 0 1 1 0 1.3h-11A.65.65 0 0 1 1.85 8ZM2.5 11.45a.65.65 0 1 0 0 1.3h11a.65.65 0 0 0 0-1.3h-11Z"
      fill="currentColor"
    />
  </svg>
);

export default SvgMore;
