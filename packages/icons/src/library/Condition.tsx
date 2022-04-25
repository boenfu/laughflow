import * as React from 'react';
import {SVGProps} from 'react';

const SvgCondition = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M3.4 1.65a.65.65 0 0 0-.65.65v2.729L1.693 7.766a.65.65 0 0 0 0 .468l1.057 2.737V13.7c0 .359.29.65.65.65h2.5a.65.65 0 1 0 0-1.3H4.05v-2.2a.65.65 0 0 0-.044-.234L2.996 8l1.01-2.616a.65.65 0 0 0 .044-.234v-2.2H5.9a.65.65 0 1 0 0-1.3H3.4ZM12.6 1.65a.65.65 0 0 1 .65.65v2.729l1.056 2.737a.65.65 0 0 1 0 .468l-1.056 2.737V13.7a.65.65 0 0 1-.65.65h-2.5a.65.65 0 1 1 0-1.3h1.85v-2.2c0-.08.015-.16.043-.234L13.003 8l-1.01-2.616a.65.65 0 0 1-.043-.234v-2.2H10.1a.65.65 0 0 1 0-1.3h2.5Z"
      fill="currentColor"
    />
  </svg>
);

export default SvgCondition;
