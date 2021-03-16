import * as React from 'react';

function SvgRedo(props: React.SVGProps<SVGSVGElement>) {
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
        d="M15.23 4.127a.648.648 0 01-.189.511l-2.028 2.029a.65.65 0 01-.92-.92l.923-.922H6.312a3.737 3.737 0 100 7.475h6.044a.65.65 0 110 1.3H6.312a5.038 5.038 0 010-10.075h6.697l-.916-.915a.65.65 0 01.92-.92L15 3.678c.13.11.216.27.23.45z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgRedo;
