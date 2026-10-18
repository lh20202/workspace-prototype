type HubId = "sales-marketing" | "infrastructure" | "personnel" | "finance";

/** Decorative identifiers for the four directory groupings. */
export default function HubHeadingIcon({ hubId }: { hubId: HubId }) {
  return (
    <svg
      className="architecture-hub-heading-icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {hubId === "sales-marketing" && (
        <>
          <path d="M7 5.8 17.5 3v9L7 9.2H3.5V5.8H7Z" />
          <path d="M7 5.8v3.4M6.5 9.2l1.2 4.5M20 5.8l1.2-.6M20 9.2l1.2.6" />
          <path d="m2.8 16.2 2.5-2.6 3.2 3.1L6 19.3l-3.2-3.1Zm18.4-.3-2.4-2.6-2.6 2.4 2.4 2.8 2.6-2.6Z" />
          <path d="m7.4 14.7 2.4-1.8h3.4l3.9 3.8-3.4 3.2a1.7 1.7 0 0 1-2.2 0l-3.8-3.2" />
          <path d="m12.7 13.1-2 2a1 1 0 0 0 1.4 1.4l1.5-1.2M13.3 18l1.4 1.1" />
        </>
      )}
      {hubId === "infrastructure" && (
        <>
          <path
            d="m14.4 3.4-.5-1.3h-3.8l-.7 2.1-1.8.8-2-.9L3 6.8l.9 2-.8 1.8-2.1.7v3.8l2.1.7.8 1.8-.9 2L5.7 22l2-.9 1.8.8.7 2.1"
            transform="translate(1.2 -1.2) scale(.91)"
          />
          <path
            d="m20.1 9.6 1.8.6V14l-2.1.7-.8 1.8.9 2-2.7 2.6-2-.9-1.8.8-.7 2.1"
            transform="translate(1.2 -1.2) scale(.91)"
          />
          <path d="M18.1 3.3a4.1 4.1 0 0 0-5.4 5.1l-6.3 6.3a2.1 2.1 0 0 0 3 3l6.3-6.3a4.1 4.1 0 0 0 5.1-5.4l-2.7 2.7-2.7-2.7 2.7-2.7Z" />
          <circle cx="8" cy="16.1" r=".65" fill="currentColor" stroke="none" />
        </>
      )}
      {hubId === "personnel" && (
        <>
          <circle cx="12" cy="5.8" r="2.4" fill="currentColor" stroke="none" />
          <circle cx="5.2" cy="8.2" r="2" fill="currentColor" stroke="none" />
          <circle cx="18.8" cy="8.2" r="2" fill="currentColor" stroke="none" />
          <path d="M7.5 20v-5.5a4.5 4.5 0 0 1 9 0V20h-9Z" />
          <path d="M5.2 12.1A3.2 3.2 0 0 0 2 15.3v3.2h3M18.8 12.1a3.2 3.2 0 0 1 3.2 3.2v3.2h-3" />
        </>
      )}
      {hubId === "finance" && (
        <>
          <path d="M15.4 11a6.6 6.6 0 1 0-4.5 4.4" />
          <path d="M11 6.5H8.2a1.8 1.8 0 0 0 0 3.6h1.3a1.8 1.8 0 0 1 0 3.6H6.8M8.9 4.9v10.3" />
          <path d="M10 18v3h11M12 17.6l3-3.3 2.5 1.7 4-4.6" />
          <circle cx="15" cy="14.3" r=".8" fill="currentColor" stroke="none" />
          <circle
            cx="21.5"
            cy="11.4"
            r=".8"
            fill="currentColor"
            stroke="none"
          />
        </>
      )}
    </svg>
  );
}
