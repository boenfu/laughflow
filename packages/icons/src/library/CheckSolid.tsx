import * as React from 'react';

function SvgCheckSolid(props: React.SVGProps<SVGSVGElement>) {
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
        id="check_solid_svg__a"
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
      <g mask="url(#check_solid_svg__a)">
        <path
          d="M8.523 14.538c-.315 0-.63-.12-.87-.36L3.96 10.486a.924.924 0 011.306-1.305l3.257 3.257 7.167-7.167a.923.923 0 011.306 1.305l-7.602 7.602c-.24.24-.556.36-.871.36z"
          fill="#fff"
        />
      </g>
    </svg>
  );
}

export default SvgCheckSolid;
