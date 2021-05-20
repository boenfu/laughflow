import * as React from 'react';

function SvgUnion(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 16 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M.35 1.1A.65.65 0 011 .45h2.168a.65.65 0 01.65.65v4.363c0 1.373.563 2.583 1.44 3.402a2.857 2.857 0 015.484 0c.876-.82 1.439-2.03 1.439-3.402V1.1a.65.65 0 01.65-.65H15a.65.65 0 110 1.3H13.48v3.713c0 2.133-1.095 4.027-2.748 5.036a2.857 2.857 0 01-5.466.001C3.614 9.49 2.518 7.596 2.518 5.463V1.75H1a.65.65 0 01-.65-.65zm9.206 8.568a1.556 1.556 0 11-3.112 0 1.556 1.556 0 013.112 0z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgUnion;
