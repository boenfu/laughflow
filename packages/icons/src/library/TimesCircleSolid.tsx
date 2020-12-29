import * as React from 'react';

function SvgTimesCircleSolid(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        opacity={0.01}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 24h24V0H0v24z"
        fill="#F2F2F2"
      />
      <mask
        id="times_circle_solid_svg__a"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={24}
        height={24}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 24h24V0H0v24z"
          fill="#fff"
        />
      </mask>
      <g mask="url(#times_circle_solid_svg__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.473 5.47c3.6-3.6 9.452-3.6 13.052 0a9.166 9.166 0 012.704 6.525c0 2.474-.96 4.791-2.704 6.527a9.152 9.152 0 01-6.526 2.713 9.176 9.176 0 01-6.526-2.713 9.134 9.134 0 01-2.705-6.527c0-2.465.96-4.781 2.705-6.526zm10.135 10.134a1.097 1.097 0 000-1.56l-2.04-2.04 2.04-2.05a1.096 1.096 0 000-1.559 1.107 1.107 0 00-1.57 0l-2.04 2.04-2.04-2.04a1.107 1.107 0 00-1.569 0 1.096 1.096 0 000 1.56l2.05 2.049-2.05 2.04a1.098 1.098 0 000 1.56 1.1 1.1 0 00.785.323c.286 0 .572-.1.785-.323l2.04-2.04 2.04 2.04c.221.222.498.323.784.323.286 0 .563-.1.785-.323z"
          fill="#E55A3A"
        />
      </g>
    </svg>
  );
}

export default SvgTimesCircleSolid;
