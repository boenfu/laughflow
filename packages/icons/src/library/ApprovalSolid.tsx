import * as React from 'react';

function SvgApprovalSolid(props: React.SVGProps<SVGSVGElement>) {
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
        d="M7.65 1.7A3.85 3.85 0 005.5 8.744c.764.597 1 1.456 0 1.456H3.65A2.65 2.65 0 001 12.85v1c0 .359.291.65.65.65h7.275a4.552 4.552 0 012.059-7.023A3.85 3.85 0 007.65 1.7z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.8 11.75a3.25 3.25 0 11-6.5 0 3.25 3.25 0 016.5 0zm-3.5 1.75a.5.5 0 01-.354-.146l-1.05-1.051a.5.5 0 01.706-.707l.698.697 1.623-1.623a.5.5 0 11.707.707l-1.977 1.977a.5.5 0 01-.353.146z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgApprovalSolid;
