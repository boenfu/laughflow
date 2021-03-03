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
        d="M13.397 9.353h-6.4v-6.4h6.4v6.4zM6.75 1.968h6.892a.74.74 0 01.739.738V9.6a.739.739 0 01-.739.738H6.751a.739.739 0 01-.739-.738V2.706c0-.407.331-.738.739-.738zm2.954 9.5a.492.492 0 11.984 0v1.823a.74.74 0 01-.738.739H3.058a.74.74 0 01-.738-.739V6.399c0-.408.331-.739.738-.739h1.823a.493.493 0 010 .985H3.305v6.4h6.4v-1.577z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgCopy;
