import * as React from 'react';

function SvgWrongSolid(props: React.SVGProps<SVGSVGElement>) {
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
        d="M8 16A8 8 0 108 0a8 8 0 000 16zM5.704 4.78a.65.65 0 00-.919.92l2.296 2.296-2.3 2.3a.65.65 0 10.92.92l2.3-2.3 2.3 2.299a.65.65 0 10.919-.92l-2.3-2.3L11.216 5.7a.65.65 0 00-.92-.92L8.002 7.078 5.704 4.78z"
        fill="#E55A3A"
      />
    </svg>
  );
}

export default SvgWrongSolid;
