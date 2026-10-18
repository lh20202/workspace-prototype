import {
  Megaphone24Regular,
  Money24Regular,
  PeopleTeam24Regular,
  Settings24Regular,
} from "@fluentui/react-icons";

type HubId = "sales-marketing" | "infrastructure" | "personnel" | "finance";

const hubIcons = {
  "sales-marketing": Megaphone24Regular,
  infrastructure: Settings24Regular,
  personnel: PeopleTeam24Regular,
  finance: Money24Regular,
};

/** Decorative identifiers for the four directory groupings. */
export default function HubHeadingIcon({ hubId }: { hubId: HubId }) {
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
