import * as React from 'react';
import {SVGProps} from 'react';

const SvgCut = (props: SVGProps<SVGSVGElement>) => (
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
      d="m7.997 7.826 1.476 1.476a2.954 2.954 0 1 0 1.16-.68L8.915 6.908l4.148-4.147a.65.65 0 0 0-.92-.92L7.998 5.988 3.85 1.84a.65.65 0 1 0-.92.92l4.148 4.147-1.715 1.715a2.954 2.954 0 1 0 1.16.678l1.474-1.474Zm-1.849 3.62a1.654 1.654 0 1 1-3.308 0 1.654 1.654 0 0 1 3.308 0Zm7.011 0a1.654 1.654 0 1 1-3.308 0 1.654 1.654 0 0 1 3.308 0Z"
      fill="currentColor"
    />
  </svg>
);

export default SvgCut;
