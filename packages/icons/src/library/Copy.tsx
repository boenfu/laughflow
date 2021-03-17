import * as React from 'react';

function SvgCopy(props: React.SVGProps<SVGSVGElement>) {
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
        d="M3.83 1.8a.65.65 0 01.65-.65H14a.65.65 0 01.65.65V12a.65.65 0 01-.65.65h-2.252v1.555a.65.65 0 01-.65.65H2a.65.65 0 01-.65-.65v-9.5a.65.65 0 01.65-.65h1.83V1.8zm1.3 2.255h5.968a.65.65 0 01.65.65v6.646h1.602V2.45H5.13v1.605zm-2.48 9.5v-8.2h7.797v8.2H2.65z"
        fill="#333"
      />
    </svg>
  );
}

export default SvgCopy;
