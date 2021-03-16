import * as React from 'react';

function SvgMore(props: React.SVGProps<SVGSVGElement>) {
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
        d="M1.85 3.9a.65.65 0 01.65-.65h11a.65.65 0 110 1.3h-11a.65.65 0 01-.65-.65zM1.85 8a.65.65 0 01.65-.65h11a.65.65 0 110 1.3h-11A.65.65 0 011.85 8zM2.5 11.45a.65.65 0 100 1.3h11a.65.65 0 000-1.3h-11z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgMore;
