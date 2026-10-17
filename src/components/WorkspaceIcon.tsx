import type { CSSProperties } from "react";
import "./WorkspaceIcon.css";

/** One environment mark for every SharePoint workspace, independent of function. */
export default function WorkspaceIcon({ size = 28 }: { size?: number }) {
  return (
    <span
      className="workspace-icon"
      aria-hidden="true"
      style={{ "--workspace-icon-size": `${size}px` } as CSSProperties}
    >
      <svg viewBox="0 0 32 32" fill="none" focusable="false">
        <path
          d="M3.5 9.5a3 3 0 0 1 3-3h6l3 3h10a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-19a3 3 0 0 1-3-3v-15Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M4 12.5h23.5" stroke="currentColor" strokeWidth="1.2" />
        <rect
          x="18.5"
          y="17.5"
          width="12"
          height="13"
          rx="2.3"
          fill="currentColor"
        />
        <text
          x="24.5"
          y="27"
          fill="white"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontSize="9"
          fontWeight="700"
        >
          S
        </text>
      </svg>
    </span>
  );
}
