import { ArrowRight20Regular } from "@fluentui/react-icons";
import "./teams-home-panel.css";
import TeamsMark from "./TeamsMark";

export interface TeamsHomeChannel {
  name: string;
  href: string;
  cue?: string;
}

/** The same product layout, with each workspace's own conversations. */
export default function TeamsHomePanel({
  heading = "Team coordination",
  description,
  channels,
  openHref,
  openLabel = "Open in Teams",
}: {
  heading?: string;
  description: string;
  channels: TeamsHomeChannel[];
  openHref: string;
  openLabel?: string;
}) {
  if (!channels.length) return null;
  return (
    <section className="teams-home-panel" aria-label={heading}>
      <h2>
        <TeamsMark size={24} labelled />
        {heading}
      </h2>
      <p>{description}</p>
      <div className="teams-home-channels">
        {channels.map((channel) => (
          <a href={channel.href} key={channel.href}>
            <TeamsMark size={18} />
            <span>
              {channel.name}
              {channel.cue && <small>{channel.cue}</small>}
            </span>
            <ArrowRight20Regular aria-hidden="true" />
          </a>
        ))}
      </div>
      <a className="teams-home-open" href={openHref}>
        {openLabel} <ArrowRight20Regular aria-hidden="true" />
      </a>
    </section>
  );
}
