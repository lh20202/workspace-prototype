import {
  workspaces,
  staff,
  selectedStaffId,
  type StaffPerson,
} from "../intranet/catalog";
import { channels, workspaceTitle } from "../logistics/data";
import { departments, departmentHref } from "../coordination/data";
import { currentProjects, projectHref, projectTitle } from "../projects/data";
import { initialIncidents } from "../executive/incidentData";
import type { TeamsGroup } from "./TeamsShell";
import {
  canSeeDepartment,
  canSeeLogisticsChannel,
  canSeeProject,
  canSeeWorkspace,
  isInformationManager,
  isWorkspaceMember,
  projectChannels,
  visibleWorkspaceChannels,
} from "./visibility";

export function teamsGroups(person: StaffPerson): TeamsGroup[] {
  const logisticsGroups: TeamsGroup[] = ["company", "logistics"].map(
    (team) => ({
      id: team,
      label: team === "company" ? "Company Updates" : workspaceTitle,
      initials: team === "company" ? "CU" : "AA",
      channels: channels
        .filter((c) => c.team === team && canSeeLogisticsChannel(person, c))
        .map((c) => ({
          id: `${team}:${c.id}`,
          label: c.name,
          unread: [
            "important",
            "pets",
            ...(person.id === "maya" ? ["central-city", "telephone"] : []),
          ].includes(c.id),
          onSelect: () =>
            location.assign(
              `/logistics/teams?${new URLSearchParams({ staff: person.id, channel: c.id, tab: "Posts" })}`,
            ),
        })),
    }),
  );
  return [
    ...logisticsGroups,
    ...workspaces
      .filter((w) => w.id !== "logistics" && canSeeWorkspace(person, w.id))
      .map((w) => ({
        id: w.id,
        label: w.title,
        channels: visibleWorkspaceChannels(person, w.id).map((name) => ({
          id: `${w.id}:${name}`,
          label: name,
          unread: w.id === "digital" && name === "AI Lab",
          private: name === "Security Engineering",
          onSelect: () =>
            location.assign(
              `/teams?${new URLSearchParams({ staff: person.id, workspace: w.id, channel: name, tab: "Posts" })}`,
            ),
        })),
      })),
    ...departments
      .filter((d) => canSeeDepartment(person, d.id))
      .map((d) => ({
        id: d.id,
        label: d.name,
        channels: [
          {
            id: `${d.id}:General`,
            label: "General",
            private: d.channelAccess === "Department-only",
            onSelect: () => location.assign(departmentHref(person.id, d.id)),
          },
        ],
      })),
    ...currentProjects
      .filter((p) => canSeeProject(person, p.code))
      .map((p) => ({
        id: p.code,
        label: projectTitle(p),
        initials: "PR",
        channels: projectChannels.map((name) => ({
          id: `${p.code}:${name}`,
          label: name,
          private: p.access === "Restricted",
          onSelect: () =>
            location.assign(
              `${projectHref(p)}/teams?${new URLSearchParams({ staff: person.id, channel: name, tab: "Posts" })}`,
            ),
        })),
      })),
    ...(isInformationManager(person)
      ? [
          {
            id: "emergency",
            label: "Emergency Response",
            initials: "ER",
            channels: initialIncidents.map((incident) => ({
              id: `emergency:${incident.id}`,
              label: `${incident.id} · ${incident.title}`,
              private: true,
              onSelect: () =>
                location.assign(
                  `/emergency-response/incidents/${incident.id}?staff=${person.id}`,
                ),
            })),
          },
        ]
      : []),
  ];
}

/** A SharePoint entry preserves a relevant preview identity, otherwise uses its work owner. */
export function teamsStaffForWorkspace(
  workspaceId: string,
  preferredId = selectedStaffId(),
) {
  const preferred = staff.find((s) => s.id === preferredId);
  if (preferred && isWorkspaceMember(preferred, workspaceId))
    return preferred.id;
  return (
    staff.find(
      (s) => !isInformationManager(s) && isWorkspaceMember(s, workspaceId),
    )?.id || "morgan"
  );
}
