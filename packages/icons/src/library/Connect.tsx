import * as React from 'react';
import {SVGProps} from 'react';

const SvgConnect = (props: SVGProps<SVGSVGElement>) => (
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
      d="M.35 3.1A.65.65 0 0 1 1 2.45H3.17a.65.65 0 0 1 .65.65v4.363c0 1.373.562 2.583 1.44 3.402a2.857 2.857 0 0 1 5.483 0c.877-.82 1.44-2.03 1.44-3.402V3.1a.65.65 0 0 1 .65-.65H15a.65.65 0 1 1 0 1.3h-1.518v3.713c0 2.133-1.096 4.027-2.748 5.036a2.857 2.857 0 0 1-5.466.001c-1.653-1.01-2.75-2.904-2.75-5.037V3.75H1a.65.65 0 0 1-.65-.65Zm9.207 8.568a1.556 1.556 0 1 1-3.113 0 1.556 1.556 0 0 1 3.113 0Z"
      fill="currentColor"
    />
  </svg>
);

export default SvgConnect;
