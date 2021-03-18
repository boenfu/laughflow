import * as React from 'react';

function SvgCheck(props: React.SVGProps<SVGSVGElement>) {
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
        d="M6.5 12.662a.651.651 0 01-.46-.19L2.47 8.914a.646.646 0 010-.916.652.652 0 01.919 0l3.11 3.1L14.526 3.1a.652.652 0 01.92 0 .646.646 0 010 .916l-8.486 8.456a.651.651 0 01-.46.19z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgCheck;
