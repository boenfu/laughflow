import * as React from 'react';

function SvgCheckCircleSolid(props: React.SVGProps<SVGSVGElement>) {
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
        id="check_circle_solid_svg__a"
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
      <g mask="url(#check_circle_solid_svg__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.77 11.998c0-2.464.96-4.791 2.703-6.527 3.601-3.6 9.454-3.6 13.053 0a9.154 9.154 0 012.705 6.527c0 2.465-.96 4.78-2.705 6.525a9.156 9.156 0 01-2.99 2.004 9.15 9.15 0 01-3.536.702 9.169 9.169 0 01-6.527-2.706 9.169 9.169 0 01-2.703-6.525zm8.603 3.646c.387 0 .756-.147 1.043-.434l4.495-4.496a1.097 1.097 0 000-1.559 1.107 1.107 0 00-1.57 0l-3.968 3.969-2.142-2.142a1.11 1.11 0 10-1.57 1.57l2.658 2.658c.287.287.656.433 1.054.433z"
          fill="#81CB5F"
        />
      </g>
    </svg>
  );
}

export default SvgCheckCircleSolid;
