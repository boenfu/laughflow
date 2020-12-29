import * as React from 'react';

function SvgPlusCircleSolid(props: React.SVGProps<SVGSVGElement>) {
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
        id="plus_circle_solid_svg__a"
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
      <g mask="url(#plus_circle_solid_svg__a)">
        <path
          d="M18.554 5.446c-3.6-3.6-9.508-3.6-13.108 0C3.692 7.2 2.77 9.508 2.77 12s.923 4.8 2.677 6.554C7.2 20.308 9.508 21.23 12 21.23c1.2 0 2.4-.277 3.508-.739 1.107-.461 2.123-1.107 2.954-2.03C20.308 16.8 21.23 14.492 21.23 12c0-2.492-.923-4.8-2.677-6.554zm-2.77 7.662h-2.676v2.677c0 .646-.462 1.107-1.108 1.107-.646 0-1.108-.461-1.108-1.107v-2.677H8.215c-.646 0-1.107-.462-1.107-1.108 0-.646.461-1.108 1.107-1.108h2.677V8.215c0-.646.462-1.107 1.108-1.107.646 0 1.108.461 1.108 1.107v2.677h2.677c.646 0 1.107.462 1.107 1.108 0 .646-.461 1.108-1.107 1.108z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export default SvgPlusCircleSolid;
