import * as React from 'react';

function SvgApproval(props: React.SVGProps<SVGSVGElement>) {
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
        d="M3.92 5.029a4.079 4.079 0 116.23 3.465v.956H12a2.65 2.65 0 012.65 2.65v2a.65.65 0 01-.65.65H2a.65.65 0 01-.65-.65v-2A2.65 2.65 0 014 9.45h1.85v-.954a4.076 4.076 0 01-1.93-3.467zM8 2.25a2.779 2.779 0 00-1.214 5.279.65.65 0 01.365.584V10.1a.65.65 0 01-.65.65H4a1.35 1.35 0 00-1.35 1.35v1.35h10.7V12.1A1.35 1.35 0 0012 10.75H9.5a.65.65 0 01-.65-.65V8.112a.65.65 0 01.365-.584A2.779 2.779 0 008 2.25z"
        fill="#333"
      />
    </svg>
  );
}

export default SvgApproval;
