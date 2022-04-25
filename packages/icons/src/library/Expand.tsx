import * as React from 'react';
import {SVGProps} from 'react';

const SvgExpand = (props: SVGProps<SVGSVGElement>) => (
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
      d="M1.75 2.4a.65.65 0 0 1 .65-.65h3.5a.65.65 0 1 1 0 1.3H3.05V5.9a.65.65 0 1 1-1.3 0V2.4Zm7.7 0a.65.65 0 0 1 .65-.65h3.5a.65.65 0 0 1 .65.65v3.5a.65.65 0 1 1-1.3 0V3.05H10.1a.65.65 0 0 1-.65-.65ZM2.4 9.45a.65.65 0 0 1 .65.65v2.85H5.9a.65.65 0 1 1 0 1.3H2.4a.65.65 0 0 1-.65-.65v-3.5a.65.65 0 0 1 .65-.65Zm11.2 0a.65.65 0 0 1 .65.65v3.5a.65.65 0 0 1-.65.65h-3.5a.65.65 0 1 1 0-1.3h2.85V10.1a.65.65 0 0 1 .65-.65Z"
      fill="currentColor"
    />
  </svg>
);

export default SvgExpand;
