import {
  ArrowRight20Regular,
  LockClosed16Regular,
} from "@fluentui/react-icons";
import "./teams-home-panel.css";
import TeamsMark from "./TeamsMark";
import { withExplicitStaff } from "../utils/staffNavigation";

export interface TeamsHomeChannel {
  id?: string;
  name: string;
  href: string;
  cue?: string;
  privacy?: "standard" | "private" | "restricted";
  lifecycle?: "Active" | "Archived";
  temporary?: boolean;
}

export interface TeamsHomeChannelGroup {
  id: string;
  label: string;
  channels: TeamsHomeChannel[];
}

/** Workspace capability is canonical; role pinning belongs to global channel navigation. */
export default function TeamsHomePanel({
  heading = "Channel coordination",
  description,
  workspace,
  channels = [],
  groups = [],
  openHref,
  openLabel = "Open channels",
}: {
  heading?: string;
  description: string;
  workspace?: { id: string; name: string };
  channels?: TeamsHomeChannel[];
  groups?: TeamsHomeChannelGroup[];
  openHref: string;
  openLabel?: string;
}) {
  if (!channels.length && !groups.some((group) => group.channels.length))
    return null;
  const channelLinks = (items: TeamsHomeChannel[]) => (
    <div className="teams-home-channels">
      {items.map((channel) => {
        const privacyCue =
          channel.privacy === "private"
            ? "Private channel"
            : channel.privacy === "restricted"
              ? "Restricted"
              : undefined;
        const lifecycleCue =
          channel.lifecycle === "Archived"
            ? "Archived"
            : channel.temporary
              ? "Temporary"
              : undefined;
        const cue = [privacyCue, lifecycleCue, channel.cue]
          .filter(Boolean)
          .join(" · ");
        return (
          <a
            href={withExplicitStaff(channel.href)}
            key={channel.id || channel.href}
            data-channel={channel.id}
          >
            <TeamsMark size={18} />
            <span>
              {channel.name}
              {cue && (
                <small>
                  {privacyCue && <LockClosed16Regular aria-hidden="true" />}
                  {cue}
                </small>
              )}
            </span>
            <ArrowRight20Regular aria-hidden="true" />
          </a>
        );
      })}
    </div>
  );
  return (
    <section
      className="teams-home-panel"
      aria-label={heading}
      data-workspace={workspace?.id}
    >
      <h2>
        <TeamsMark size={24} labelled />
        {heading}
      </h2>
      <p>{description}</p>
      {channelLinks(channels)}
      {groups
        .filter((group) => group.channels.length)
        .map((group) => (
          <div className="teams-home-channel-group" key={group.id}>
            <h3>{group.label}</h3>
            {channelLinks(group.channels)}
          </div>
        ))}
      <a className="teams-home-open" href={withExplicitStaff(openHref)}>
        {openLabel} <ArrowRight20Regular aria-hidden="true" />
      </a>
    </section>
  );
}
