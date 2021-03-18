import * as React from 'react';

function SvgJump(props: React.SVGProps<SVGSVGElement>) {
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
        d="M10.335 2.14a.65.65 0 10-.92.92l2.166 2.165-6.302 6.302v-4.02a.65.65 0 00-1.3 0v5.52a.649.649 0 00.65.723h5.592a.65.65 0 100-1.3H6.194l6.766-6.765a.65.65 0 000-.92L10.334 2.14z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgJump;
