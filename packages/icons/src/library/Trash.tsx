import * as React from 'react';

function SvgTrash(props: React.SVGProps<SVGSVGElement>) {
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
        d="M9.57 2.985H6.43a.493.493 0 010-.985h3.14a.492.492 0 010 .985zm3.61.698H2.82a.493.493 0 000 .984h.45v8.488c0 .41.331.743.738.743h7.984a.742.742 0 00.738-.743V4.667h.45a.493.493 0 000-.984zm-8.926 9.23h7.492V4.668H4.254v8.247zm2.854-2.522a.493.493 0 01-.984 0V7.19a.493.493 0 01.984 0v3.201zm2.275.493c.272 0 .493-.22.493-.493V7.19a.493.493 0 00-.985 0v3.201c0 .272.221.493.492.493z"
        fill="#666"
      />
    </svg>
  );
}

export default SvgTrash;
