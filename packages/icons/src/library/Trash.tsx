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
        d="M5.487.85a.65.65 0 00-.65.65v1.822H1.95a.65.65 0 000 1.3h.643l.806 9.334a.65.65 0 00.648.594h7.906a.65.65 0 00.647-.594l.807-9.334h.643a.65.65 0 100-1.3h-2.888V1.5a.65.65 0 00-.65-.65H5.487zm4.375 2.472V2.15H6.137v1.172h3.725zm-5.965 1.3h8.205l-.745 8.628H4.643l-.746-8.628z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgTrash;
