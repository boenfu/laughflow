import * as React from 'react';

function SvgUserSolid(props: React.SVGProps<SVGSVGElement>) {
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
        d="M8.011 2a3.361 3.361 0 100 6.722 3.361 3.361 0 000-6.722zM5.293 9.959c-.59-.156-1.218-.309-1.789-.089A2.507 2.507 0 001.9 12.21v1.703c0 .34.275.614.615.614h10.97c.34 0 .615-.275.615-.614v-1.704c0-1.07-.671-1.984-1.616-2.343-.564-.215-1.183-.066-1.766.087-2.018.441-3.437.441-5.425.006z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgUserSolid;
