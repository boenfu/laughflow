import * as React from 'react';

function SvgJumpSolid(props: React.SVGProps<SVGSVGElement>) {
  return (
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
        d="M8 16A8 8 0 108 0a8 8 0 000 16zm.669-12.66a.65.65 0 01.919 0l2.17 2.17a.65.65 0 010 .92l-4.759 4.758H9.51a.65.65 0 110 1.3H5.433a.65.65 0 01-.65-.65V7.76a.65.65 0 011.3 0v2.505L10.38 5.97l-1.71-1.71a.65.65 0 010-.92z"
        fill="#296DFF"
      />
    </svg>
  );
}

export default SvgJumpSolid;
