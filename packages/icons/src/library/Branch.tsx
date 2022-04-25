import * as React from 'react';
import {SVGProps} from 'react';

const SvgBranch = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M13.621 3.404a.379.379 0 0 1 0 .64l-2.274 1.444a.379.379 0 0 1-.582-.32v-.794H7.4l-2.885 4.04a.65.65 0 0 1-.53.272H.95a.65.65 0 0 1 0-1.3h2.7l2.886-4.04a.65.65 0 0 1 .529-.272h3.701v-.795c0-.298.33-.48.581-.32l2.274 1.445ZM7.065 12.998a.65.65 0 0 1-.529-.272l-1.555-2.177a.65.65 0 1 1 1.058-.756l1.36 1.905h3.367v-.795c0-.299.33-.48.581-.32l2.274 1.445a.379.379 0 0 1 0 .64l-2.274 1.444a.379.379 0 0 1-.582-.32v-.794h-3.7Z"
      fill="currentColor"
    />
  </svg>
);

export default SvgBranch;
