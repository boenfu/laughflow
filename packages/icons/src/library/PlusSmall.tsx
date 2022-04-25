import * as React from 'react';
import {SVGProps} from 'react';

const SvgPlusSmall = (props: SVGProps<SVGSVGElement>) => (
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
      d="M7.998 4c.346 0 .626.28.626.627V7.37h2.75a.627.627 0 0 1 0 1.253h-2.75v2.75a.627.627 0 0 1-1.253 0v-2.75H4.627a.627.627 0 0 1 0-1.253H7.37V4.627c0-.346.28-.627.627-.627Z"
      fill="currentColor"
    />
  </svg>
);

export default SvgPlusSmall;
