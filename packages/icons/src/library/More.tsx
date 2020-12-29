import * as React from 'react';

function SvgMore(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        opacity={0.01}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 18h18V0H0v18z"
        fill="#666"
      />
      <mask
        id="more_svg__a"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={18}
        height={18}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 18h18V0H0v18z"
          fill="#fff"
        />
      </mask>
      <g mask="url(#more_svg__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.539 5.4H3.462a.554.554 0 110-1.108h11.077a.554.554 0 010 1.108zm0 3.046H3.462a.554.554 0 100 1.108h11.077a.554.554 0 000-1.108zm0 4.154H3.462a.554.554 0 100 1.108h11.077a.554.554 0 000-1.108z"
          fill="#666"
        />
      </g>
    </svg>
  );
}

export default SvgMore;
