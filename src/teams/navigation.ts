import {
  workspaces,
  selectedStaffId,
  resolveStaffPerson,
  type StaffPerson,
} from "../intranet/catalog";
import { channels, workspaceTitle } from "../logistics/data";
import {
  departments,
  departmentHref,
  resolveDepartment,
} from "../coordination/data";
import { currentProjects, projectHref, projectTitle } from "../projects/data";
import { initialIncidents } from "../executive/incidentData";
import {
  canAccessChannel,
  canAccessEmergency,
  previewRoleFor,
  departmentPreviewFor,
} from "../access/policy";
import { resolveContentChannel, contentDefaultTab } from "../content/channels";
import type { TeamsGroup } from "./TeamsShell";
import {
  canSeeDepartment,
  canSeeLogisticsChannel,
  canSeeProject,
  canSeeWorkspace,
  canSeeWorkspaceChannel,
  projectChannels,
  visibleWorkspaceChannels,
} from "./visibility";

export interface DefaultTeamsContext {
  workspaceId: string | undefined;
  departmentId: string | undefined;
  channel?: string;
  companyChannelId?: string;
}

/** Teams landings follow explicit participation, independently of SharePoint access. */
export function defaultTeamsContext(person: StaffPerson): DefaultTeamsContext {
  const role = previewRoleFor(person);
  const departmentPreview = departmentPreviewFor(person);
  if (departmentPreview)
    return { workspaceId: undefined, departmentId: departmentPreview };
  const primary = role?.teamsLanding;
  if (
    primary?.kind === "workspace" &&
    canSeeWorkspaceChannel(person, primary.workspaceId, primary.channelId)
  )
    return {
      workspaceId: primary.workspaceId,
      departmentId: undefined,
      channel: primary.channelId,
    };
  if (
    primary?.kind === "department" &&
    canSeeDepartment(person, primary.departmentId) &&
    departments.some((item) => item.id === primary.departmentId)
  )
    return { workspaceId: undefined, departmentId: primary.departmentId };
  if (
    primary?.kind === "company" &&
    canAccessChannel(person, "company", primary.channelId)
  )
    return {
      workspaceId: undefined,
      departmentId: undefined,
      companyChannelId: primary.channelId,
    };
  const joinedWorkspace = Object.keys(role?.teamChannels || {}).find((id) =>
    canSeeWorkspace(person, id),
  );
  if (joinedWorkspace)
    return {
      workspaceId: joinedWorkspace,
      departmentId: undefined,
      channel: visibleWorkspaceChannels(person, joinedWorkspace)[0],
    };
  const department = departments.find((item) =>
    canSeeDepartment(person, item.id),
  );
  return department
    ? { workspaceId: undefined, departmentId: department.id }
    : {
        workspaceId: undefined,
        departmentId: undefined,
        companyChannelId: "important",
      };
}

export function teamsGroups(person: StaffPerson): TeamsGroup[] {
  const departmentPreview = departmentPreviewFor(person);
  const logisticsGroups: TeamsGroup[] = ["company", "logistics"].flatMap(
    (team) => {
      const joinedChannels = channels.filter(
        (channel) =>
          channel.team === team &&
          (!departmentPreview || team === "company") &&
          canSeeLogisticsChannel(person, channel),
      );
      if (!joinedChannels.length) return [];
      return [
        {
          id: team,
          kind: team === "company" ? "company" : "workspace",
          label: team === "company" ? "Company Updates" : workspaceTitle,
          channels: joinedChannels.map((c) => ({
            id: `${team}:${c.id}`,
            label: c.name,
            unread: ["important", "pets", "central-city", "telephone"].includes(
              c.id,
            ),
            onSelect: () =>
              location.assign(
                `/logistics/teams?${new URLSearchParams({ staff: person.id, channel: c.id, tab: "Posts", ...(departmentPreview ? { departmentPreview } : {}) })}`,
              ),
          })),
        },
      ];
    },
  );
  return [
    ...logisticsGroups,
    ...workspaces
      .filter(
        (w) =>
          !departmentPreview &&
          w.id !== "logistics" &&
          canSeeWorkspace(person, w.id),
      )
      .map((w) => ({
        id: w.id,
        kind: "workspace" as const,
        label: w.title,
        channels: visibleWorkspaceChannels(person, w.id).map((name) => ({
          id: `${w.id}:${name}`,
          label: name,
          unread: w.id === "digital" && name === "AI Lab",
          private: name === "Security Engineering",
          cue:
            w.id === "content" &&
            resolveContentChannel(name)?.kind === "temporary"
              ? resolveContentChannel(name)?.lifecycle === "Archived"
                ? ("Archived" as const)
                : ("Temporary" as const)
              : undefined,
          onSelect: () =>
            location.assign(
              `/teams?${new URLSearchParams({ staff: person.id, workspace: w.id, channel: name, tab: w.id === "content" ? contentDefaultTab(name) : "Posts" })}`,
            ),
        })),
      })),
    ...departments
      .filter((d) => canSeeDepartment(person, d.id))
      .map((d) => ({
        id: d.id,
        kind: "department" as const,
        label: d.name,
        channels: [
          {
            id: `${d.id}:General`,
            label: "General",
            private: d.channelAccess === "Department-only",
            onSelect: () =>
              location.assign(
                departmentPreview
                  ? `/teams?${new URLSearchParams({ staff: person.id, department: d.id, departmentPreview: d.id, tab: "Posts" })}`
                  : departmentHref(person.id, d.id),
              ),
          },
        ],
      })),
    ...currentProjects
      .filter((p) => !departmentPreview && canSeeProject(person, p.code))
      .map((p) => ({
        id: p.code,
        kind: "project" as const,
        label: projectTitle(p),
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
    ...(!departmentPreview &&
    initialIncidents.some((incident) => canAccessEmergency(person, incident.id))
      ? [
          {
            id: "emergency",
            kind: "emergency" as const,
            label: "Emergency Response",
            channels: initialIncidents
              .filter((incident) => canAccessEmergency(person, incident.id))
              .map((incident) => ({
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
  ].filter((group) => group.channels.length > 0);
}

/** Opening Teams never changes the colleague selected in the preview controls. */
export function teamsStaffForWorkspace(
  _workspaceId: string,
  preferredId = selectedStaffId(),
) {
  return resolveStaffPerson(preferredId).id;
}

/** A persona switch retains only a channel the next colleague actually joined. */
export function teamsPreviewHrefForStaff(
  person: StaffPerson,
  pathname: string,
  search: string,
) {
  const params = new URLSearchParams(search);
  const previousStaffId = params.get("staff");
  params.set("staff", person.id);
  const ownTeams = `/teams?${new URLSearchParams({ staff: person.id })}`;
  if (params.has("departmentPreview")) return ownTeams;
  // A post focus is only meaningful within the original channel and identity.
  if (previousStaffId !== person.id) params.delete("post");
  if (
    pathname === "/logistics/teams" ||
    pathname.startsWith("/logistics/teams/")
  ) {
    const channel = channels.find(
      (item) => item.id === (params.get("channel") || "general"),
    );
    if (!channel || !canSeeLogisticsChannel(person, channel)) {
      return ownTeams;
    }
  } else if (pathname === "/teams") {
    const departmentValue = params.get("department") || params.get("division");
    const department = resolveDepartment(departmentValue);
    if (departmentValue) {
      if (!department || !canSeeDepartment(person, department.id))
        return ownTeams;
      if (
        person.id !== previousStaffId &&
        defaultTeamsContext(person).workspaceId
      )
        return ownTeams;
      // Unit/file context belongs to the previous person; restart at their common department view.
      for (const key of ["unit", "section", "folder", "file", "document"])
        params.delete(key);
    } else {
      const workspaceId = params.get("workspace");
      if (
        !workspaceId ||
        !canSeeWorkspaceChannel(
          person,
          workspaceId,
          params.get("channel") || "General",
        )
      )
        return ownTeams;
    }
  } else if (pathname.startsWith("/projects/")) {
    const code =
      pathname.split("/").find((part) => part.startsWith("PRJ-")) || "";
    if (!canSeeProject(person, code)) return ownTeams;
  } else if (pathname.startsWith("/emergency-response")) {
    const incidentId = pathname.split("/")[3];
    if (
      !initialIncidents.some(
        (incident) =>
          incident.id === incidentId && canAccessEmergency(person, incident.id),
      )
    )
      return ownTeams;
  }
  return `${pathname}?${params}`;
}
