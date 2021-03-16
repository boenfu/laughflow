import * as React from 'react';

function SvgCombineSolid(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M8 12a.7.7 0 100-1.4.7.7 0 000 1.4z" fill="#FFBB29" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 16A8 8 0 108 0a8 8 0 000 16zM2.8 4.65a.65.65 0 000 1.3h.96v2.139c0 1.66.947 3.102 2.33 3.805a2 2 0 003.82 0 4.265 4.265 0 002.329-3.805V5.95h.96a.65.65 0 100-1.3h-1.61a.65.65 0 00-.65.65v2.789c0 .953-.446 1.799-1.138 2.34a2 2 0 00-3.602 0 2.963 2.963 0 01-1.138-2.34V5.3a.65.65 0 00-.65-.65H2.8z"
        fill="#FFBB29"
      />
    </svg>
  );
}

export default SvgCombineSolid;
