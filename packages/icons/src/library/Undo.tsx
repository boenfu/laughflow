import * as React from 'react';

function SvgUndo(props: React.SVGProps<SVGSVGElement>) {
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
        d="M1.276 4.127a.649.649 0 00.189.511l2.028 2.029a.65.65 0 10.92-.92l-.923-.922h6.704a3.738 3.738 0 010 7.475H4.15a.65.65 0 100 1.3h6.043a5.038 5.038 0 000-10.075H3.498l.916-.915a.65.65 0 00-.92-.92L1.506 3.678a.649.649 0 00-.23.45z"
        fill="#333"
      />
    </svg>
  );
}

export default SvgUndo;
