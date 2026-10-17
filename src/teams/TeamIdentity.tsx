import type { CSSProperties } from "react";
import { Alert20Regular, PeopleTeam20Regular } from "@fluentui/react-icons";
import WorkspaceIcon from "../components/WorkspaceIcon";
import "./team-identity.css";

export type TeamKind =
  "company" | "workspace" | "department" | "project" | "emergency";

/** A fixed palette: the same Team keeps its accent across roles and channels. */
export const workspaceTeamPalette = [
  "#286e78", // teal
  "#376b9b", // blue
  "#575a9c", // indigo
  "#795d8e", // muted purple
  "#49745a", // green
  "#8b692f", // amber
  "#596a7c", // slate
  "#975c73", // rose
] as const;

export function workspaceTeamAccent(id: string): string {
  const hash = [...id].reduce(
    (value, letter) => (value * 31 + letter.charCodeAt(0)) >>> 0,
    0,
  );
  return workspaceTeamPalette[hash % workspaceTeamPalette.length];
}

export interface TeamIdentityProps {
  kind: TeamKind;
  id: string;
  size?: number;
}

/** Parent Teams use their environment identity, independently of channel icons. */
export default function TeamIdentity({
  kind,
  id,
  size = 26,
}: TeamIdentityProps) {
  return (
    <span
      className={`team-identity team-identity-${kind}`}
      data-team-kind={kind}
      data-team-id={id}
      aria-hidden="true"
      style={
        {
          "--team-identity-size": `${size}px`,
          "--team-workspace-accent": workspaceTeamAccent(id),
        } as CSSProperties
      }
    >
      {kind === "company" ? (
        <img src="/images/company-mark.png" alt="" />
      ) : kind === "workspace" || kind === "project" ? (
        <WorkspaceIcon size={size} />
      ) : kind === "emergency" ? (
        <Alert20Regular />
      ) : (
        <PeopleTeam20Regular />
      )}
    </span>
  );
}
