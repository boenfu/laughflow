import * as React from 'react';

function SvgUserDefault(props: React.SVGProps<SVGSVGElement>) {
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
        opacity={0.01}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 16h16V0H0v16z"
        fill="#F2F2F2"
      />
      <mask
        id="user_default_svg__a"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={16}
        height={16}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 16h16V0H0v16z"
          fill="#fff"
        />
      </mask>
      <g mask="url(#user_default_svg__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.003 7.912a2.725 2.725 0 000-5.45 2.73 2.73 0 00-2.726 2.725 2.727 2.727 0 002.726 2.725zm5.137 4.81V11.47c0-.197-.036-.423-.12-.654-.38-1.126-1.512-1.879-2.814-1.879H5.788c-1.457 0-2.702.943-2.9 2.195-.02.12-.028.232-.028.345v1.245c0 .45.38.816.845.816h8.59c.465 0 .845-.365.845-.816z"
          fill="#fff"
        />
      </g>
    </svg>
  );
}

export default SvgUserDefault;
