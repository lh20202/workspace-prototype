import {
  Megaphone24Regular,
  PeopleTeam24Regular,
  Settings24Regular,
} from "@fluentui/react-icons";

type HubId = "sales-marketing" | "infrastructure" | "personnel" | "finance";

const hubIcons = {
  "sales-marketing": Megaphone24Regular,
  infrastructure: Settings24Regular,
  personnel: PeopleTeam24Regular,
};

/** Decorative identifiers for the four directory groupings. */
export default function HubHeadingIcon({ hubId }: { hubId: HubId }) {
  if (hubId === "finance") {
    return (
      <svg
        className="architecture-hub-heading-icon"
        viewBox="0 0 24 24"
        width={24}
        height={24}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M17 7.5C17 5.6 15 4 12 4S7 5.5 7 8s2 3 5 4 5 1.5 5 4-2 4-5 4-5-1.6-5-3.5M12 2v20" />
      </svg>
    );
  }
  const Icon = hubIcons[hubId];

  return (
    <Icon
      className="architecture-hub-heading-icon"
      width={24}
      height={24}
      aria-hidden="true"
      focusable="false"
    />
  );
}
