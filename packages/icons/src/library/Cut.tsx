import * as React from 'react';

function SvgCut(props: React.SVGProps<SVGSVGElement>) {
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
        d="M7.997 7.826l1.476 1.476a2.954 2.954 0 101.16-.68L8.915 6.908l4.148-4.147a.65.65 0 00-.92-.92L7.998 5.988 3.85 1.84a.65.65 0 10-.92.92l4.148 4.147-1.715 1.715a2.954 2.954 0 101.16.678l1.474-1.474zm-1.849 3.62a1.654 1.654 0 11-3.308 0 1.654 1.654 0 013.308 0zm7.011 0a1.654 1.654 0 11-3.308 0 1.654 1.654 0 013.308 0z"
        fill="#333"
      />
    </svg>
  );
}

export default SvgCut;
