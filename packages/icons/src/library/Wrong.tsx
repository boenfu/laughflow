import * as React from 'react';
import {SVGProps} from 'react';

const SvgWrong = (props: SVGProps<SVGSVGElement>) => (
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
      d="M3.047 3.04a.65.65 0 0 1 .92 0L8 7.078l4.034-4.036a.65.65 0 0 1 .92.919L8.919 7.997l4.04 4.043a.65.65 0 0 1-.919.919L8 8.916 3.96 12.96a.65.65 0 1 1-.92-.918l4.041-4.044-4.034-4.038a.65.65 0 0 1 0-.919Z"
      fill="currentColor"
    />
  </svg>
);

export default SvgWrong;
