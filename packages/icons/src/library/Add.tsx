import * as React from 'react';

function SvgAdd(props: React.SVGProps<SVGSVGElement>) {
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
        d="M7.996 1.85a.65.65 0 01.65.65v4.846H13.5a.65.65 0 110 1.3H8.646V13.5a.65.65 0 11-1.3 0V8.646H2.5a.65.65 0 110-1.3h4.846V2.5a.65.65 0 01.65-.65z"
        fill="#333"
      />
    </svg>
  );
}

export default SvgAdd;
