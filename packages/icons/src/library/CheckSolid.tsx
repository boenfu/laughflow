import * as React from 'react';
import {SVGProps} from 'react';

const SvgCheckSolid = (props: SVGProps<SVGSVGElement>) => (
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
      d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Zm-1.333-4.873a.65.65 0 0 0 .92 0l5.27-5.27a.65.65 0 1 0-.92-.92l-4.81 4.811-2.343-2.342a.65.65 0 0 0-.92.919l2.803 2.802Z"
      fill="#81CB5F"
    />
  </svg>
);

export default SvgCheckSolid;
