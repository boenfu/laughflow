import * as React from 'react';

function SvgExpand(props: React.SVGProps<SVGSVGElement>) {
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
        d="M1.65 2.3a.65.65 0 01.65-.65h3.562a.65.65 0 010 1.3H2.95v2.913a.65.65 0 11-1.3 0V2.3zm7.837 0a.65.65 0 01.65-.65H13.7a.65.65 0 01.65.65v3.563a.65.65 0 11-1.3 0V2.95h-2.913a.65.65 0 01-.65-.65zM2.3 9.488a.65.65 0 01.65.65v2.912h2.912a.65.65 0 110 1.3H2.3a.65.65 0 01-.65-.65v-3.563a.65.65 0 01.65-.65zm11.4 0a.65.65 0 01.65.65V13.7a.65.65 0 01-.65.65h-3.563a.65.65 0 110-1.3h2.913v-2.913a.65.65 0 01.65-.65z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgExpand;
