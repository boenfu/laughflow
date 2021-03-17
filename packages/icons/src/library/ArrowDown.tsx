import * as React from 'react';

function SvgArrowDown(props: React.SVGProps<SVGSVGElement>) {
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
        d="M8.652 2.2a.65.65 0 00-1.3 0v9.925L3.55 8.322a.65.65 0 00-.92.92l4.862 4.86a.649.649 0 001.022-.002l4.86-4.859a.65.65 0 00-.92-.919l-3.802 3.802V2.2z"
        fill="#333"
      />
    </svg>
  );
}

export default SvgArrowDown;
