import * as React from 'react';
import {SVGProps} from 'react';

const SvgCombineSolid = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M8 12a.7.7 0 1 0 0-1.4.7.7 0 0 0 0 1.4Z" fill="#FFBB29" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16ZM2.8 4.65a.65.65 0 0 0 0 1.3h.96v2.139c0 1.66.947 3.102 2.33 3.805a2 2 0 0 0 3.82 0 4.265 4.265 0 0 0 2.329-3.805V5.95h.96a.65.65 0 1 0 0-1.3h-1.61a.65.65 0 0 0-.65.65v2.789c0 .953-.446 1.799-1.138 2.34a2 2 0 0 0-3.602 0 2.963 2.963 0 0 1-1.138-2.34V5.3a.65.65 0 0 0-.65-.65H2.8Z"
      fill="#FFBB29"
    />
  </svg>
);

export default SvgCombineSolid;
