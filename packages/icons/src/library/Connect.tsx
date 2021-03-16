import * as React from 'react';

function SvgConnect(props: React.SVGProps<SVGSVGElement>) {
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
        d="M.95 4a.65.65 0 01.65-.65h1.983a.65.65 0 01.65.65v3.989c0 1.23.5 2.312 1.279 3.05a2.612 2.612 0 014.976.001c.78-.738 1.28-1.821 1.28-3.051V4a.65.65 0 01.65-.65H14.4a.65.65 0 110 1.3h-1.333v3.339c0 1.992-1.036 3.762-2.595 4.686a2.612 2.612 0 01-4.945 0C3.97 11.75 2.933 9.98 2.933 7.989V4.65H1.6A.65.65 0 01.95 4zm8.361 7.834a1.311 1.311 0 11-2.622 0 1.311 1.311 0 012.622 0z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgConnect;
