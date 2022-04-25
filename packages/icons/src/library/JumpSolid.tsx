import * as React from 'react';
import {SVGProps} from 'react';

const SvgJumpSolid = (props: SVGProps<SVGSVGElement>) => (
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
      d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Zm.669-12.66a.65.65 0 0 1 .919 0l2.17 2.17a.65.65 0 0 1 0 .92l-4.759 4.758H9.51a.65.65 0 1 1 0 1.3H5.433a.65.65 0 0 1-.65-.65V7.76a.65.65 0 0 1 1.3 0v2.505L10.38 5.97l-1.71-1.71a.65.65 0 0 1 0-.92Z"
      fill="#296DFF"
    />
  </svg>
);

export default SvgJumpSolid;
