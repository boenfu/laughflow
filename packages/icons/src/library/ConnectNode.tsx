import * as React from 'react';

function SvgConnectNode(props: React.SVGProps<SVGSVGElement>) {
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
        id="connect_node_svg__a"
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
      <g mask="url(#connect_node_svg__a)">
        <path
          d="M21.23 12c0 2.492-.922 4.8-2.676 6.554-.83.83-1.846 1.569-2.954 2.03-1.2.37-2.4.647-3.6.647-2.492 0-4.8-.923-6.554-2.677C3.692 16.8 2.77 14.492 2.77 12s.923-4.8 2.677-6.554c3.6-3.6 9.508-3.6 13.108 0C20.308 7.2 21.23 9.508 21.23 12z"
          fill="#296DFF"
        />
        <path
          d="M15.096 12.266l-3.01-3.364h.443c.62 0 1.063-.443 1.151-.974 0-.62-.443-1.062-.974-1.151L9.873 6.6c-.796 0-1.416.531-1.504 1.328l-.089 2.921c0 .62.443 1.063.974 1.151h.088c.531 0 .974-.443 1.063-.974v-.708l3.098 3.453c.088.176.177.354.177.53a.487.487 0 01-.265.443l-.886.797c-.442.354-.442 1.062-.088 1.505.177.265.53.354.796.354s.532-.088.709-.266l.885-.796c.531-.532.885-1.151.974-1.948 0-.797-.266-1.505-.709-2.124z"
          fill="#fff"
        />
      </g>
    </svg>
  );
}

export default SvgConnectNode;
