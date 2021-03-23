import * as React from 'react';

function SvgExchange(props: React.SVGProps<SVGSVGElement>) {
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
        d="M12.87 6.219a.522.522 0 110 1.045H3.39a.783.783 0 01-.554-1.339L5.041 3.72a.523.523 0 01.74.74L4.02 6.219h8.85zm.294 4.53l-2.205 2.204a.522.522 0 11-.739-.74l1.759-1.758h-8.85a.523.523 0 010-1.045h9.481a.782.782 0 01.554 1.338z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgExchange;
