import * as React from 'react';

function SvgAddSolid(props: React.SVGProps<SVGSVGElement>) {
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
        d="M8 16A8 8 0 108 0a8 8 0 000 16zm.648-11.7a.65.65 0 00-1.3 0v3.047H4.3a.65.65 0 000 1.3h3.048V11.7a.65.65 0 101.3 0V8.647H11.7a.65.65 0 100-1.3H8.648V4.3z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgAddSolid;
