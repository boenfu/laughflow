import * as React from 'react';

function SvgCombine(props: React.SVGProps<SVGSVGElement>) {
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
        d="M.27 3c0 .359.291.65.65.65h1.543v3.06c0 2.27 1.365 4.22 3.32 5.074a2.331 2.331 0 001.566 1.529V14.5a.65.65 0 001.3 0v-1.187a2.331 2.331 0 001.568-1.529 5.537 5.537 0 003.318-5.074V3.65h1.543a.65.65 0 100-1.3h-2.193a.65.65 0 00-.65.65v3.71a4.234 4.234 0 01-2.033 3.62 2.327 2.327 0 00-4.405 0 4.234 4.234 0 01-2.034-3.62V3a.65.65 0 00-.65-.65H.92A.65.65 0 00.27 3zm8.755 8.08a1.026 1.026 0 11-2.052 0 1.026 1.026 0 012.052 0z"
        fill="#333"
      />
    </svg>
  );
}

export default SvgCombine;
