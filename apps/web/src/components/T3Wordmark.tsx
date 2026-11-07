import type { SVGProps } from "react";

// One link, centred on the origin along x: a 40-thick bar with a pointed bulge in the middle.
const LINK = "M-80-20H-40Q-18-26 0-46Q18-26 40-20H80V20H40Q18 26 0 46Q-18 26-40 20H-80Z";
const LINK_TRANSFORMS = [
  "translate(310 125)",
  "translate(310 495)",
  "translate(310 865)",
  "translate(495 310) rotate(90)",
  "translate(125 680) rotate(90)",
];

/**
 * Tabula Rasa's brand mark in currentColor: six linked sockets on a 370 grid, so every link
 * bridges the same gap. Mirrors assets/app-icon/mark.svg; the name is kept to ease upstream merges.
 */
export function T3Wordmark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 620 990" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="currentColor" strokeWidth="40">
        {[125, 495, 865].flatMap((cy) =>
          [125, 495].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="105" />),
        )}
      </g>
      <g fill="currentColor">
        {LINK_TRANSFORMS.map((transform) => (
          <path key={transform} d={LINK} transform={transform} />
        ))}
      </g>
    </svg>
  );
}
