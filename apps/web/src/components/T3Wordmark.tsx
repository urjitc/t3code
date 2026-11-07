import type { SVGProps } from "react";

/** Tabula Rasa's brand mark: six linked sockets, drawn in currentColor (name kept to ease upstream merges). */
export function T3Wordmark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="-12 -12 704 934" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="currentColor" strokeWidth="42">
        <circle cx="125" cy="128" r="104" />
        <circle cx="555" cy="128" r="104" />
        <circle cx="125" cy="452" r="104" />
        <circle cx="555" cy="452" r="104" />
        <circle cx="125" cy="780" r="104" />
        <circle cx="555" cy="780" r="104" />
      </g>
      <g fill="currentColor">
        <rect x="225" y="108" width="230" height="40" />
        <rect x="225" y="432" width="230" height="40" />
        <rect x="225" y="760" width="230" height="40" />
        <rect x="535" y="228" width="40" height="128" />
        <rect x="105" y="552" width="40" height="132" />
      </g>
    </svg>
  );
}
