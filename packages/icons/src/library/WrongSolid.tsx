import * as React from 'react';
import {SVGProps} from 'react';

const SvgWrongSolid = (props: SVGProps<SVGSVGElement>) => (
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
      d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16ZM5.704 4.78a.65.65 0 0 0-.919.92l2.296 2.296-2.3 2.3a.65.65 0 1 0 .92.92l2.3-2.3 2.3 2.299a.65.65 0 1 0 .919-.92l-2.3-2.3L11.216 5.7a.65.65 0 0 0-.92-.92L8.002 7.078 5.704 4.78Z"
      fill="#E55A3A"
    />
  </svg>
);

export default SvgWrongSolid;
