import React, { SVGProps } from "react";
interface SvrArrowProps extends SVGProps<SVGSVGElement> {}
export const ArrowLeft = ({
  width = "35",
  height = "35",
  stroke = "#5C5C5C",
  strokeWidth = "2",
  fill = "none",
}: SvrArrowProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 35 35"
    fill={fill}
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="arrow-left">
      <path
        id="Vector"
        d="M21.5 25.5L13.5 18L21.5 10.5"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

export const ArrowRight = ({
  width = "35",
  height = "35",
  stroke = "#5C5C5C",
  strokeWidth = "2",
  fill = "none",
}: SvrArrowProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 35 35"
    fill={fill}
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="arrow-right">
      <path
        id="Vector"
        d="M13.5 25.5L21.5 18L13.5 10.5"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);
