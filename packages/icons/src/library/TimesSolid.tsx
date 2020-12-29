import * as React from 'react';

function SvgTimesSolid(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        opacity={0.01}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 20h20V0H0v20z"
        fill="#F2F2F2"
      />
      <mask
        id="times_solid_svg__a"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={20}
        height={20}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 20h20V0H0v20z"
          fill="#fff"
        />
      </mask>
      <g mask="url(#times_solid_svg__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.23 10l3.515-3.515a.869.869 0 10-1.23-1.23L10 8.77 6.485 5.255a.869.869 0 10-1.23 1.23L8.77 10l-3.515 3.516a.869.869 0 101.23 1.23L10 11.23l3.515 3.516a.866.866 0 001.23 0c.34-.34.34-.89 0-1.23L11.23 10z"
          fill="#fff"
        />
      </g>
    </svg>
  );
}

export default SvgTimesSolid;
