import * as React from 'react';
import {SVGProps} from 'react';

const SvgPlus = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.996 1.515a.65.65 0 0 1 .65.65v5.18h5.188a.65.65 0 1 1 0 1.3H8.646v5.19a.65.65 0 1 1-1.3 0v-5.19H2.165a.65.65 0 1 1 0-1.3h5.18v-5.18a.65.65 0 0 1 .65-.65Z"
      fill="currentColor"
    />
  </svg>
);

export default SvgPlus;
