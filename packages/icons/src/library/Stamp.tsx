import * as React from 'react';

function SvgStamp(props: React.SVGProps<SVGSVGElement>) {
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
        d="M1 16h14v-2H1v2zm12-8h-2.094A.907.907 0 0110 7.094v-.282c0-.875.25-1.687.656-2.437.281-.563.406-1.219.281-1.906C10.72 1.28 9.75.28 8.531.063A2.984 2.984 0 005 3c0 .469.094.875.25 1.25.438.906.75 1.844.75 2.844 0 .5-.438.906-.938.906H3a2.98 2.98 0 00-3 3v1c0 .563.438 1 1 1h14c.531 0 1-.438 1-1v-1a3 3 0 00-3-3z"
        fill="#4A4E58"
        fillOpacity={0.2}
      />
    </svg>
  );
}

export default SvgStamp;
