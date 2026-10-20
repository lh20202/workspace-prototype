import {
  workspaces,
  selectedStaffId,
  resolveStaffPerson,
  type StaffPerson,
} from "../intranet/catalog";
import { channels, workspaceTitle } from "../logistics/data";
import {
  departments,
  unitFolders,
  unitParentFolders,
} from "../coordination/data";
import {
  allProjects,
  currentProjects,
  projectHref,
  projectTitle,
} from "../projects/data";
import { initialIncidents } from "../executive/incidentData";
import { demoMode } from "../utils/demoMode";
import { withExplicitStaff } from "../utils/staffNavigation";
import {
  canAccessChannel,
  canAccessEmergency,
  previewRoleFor,
  departmentPreviewFor,
  defaultPreviewRoleId,
  isProjectPinnedForRole,
} from "../access/policy";
import { resolveContentChannel, contentDefaultTab } from "../content/channels";
import type { TeamsGroup } from "./TeamsShell";
import {
  canSeeDepartment,
  canSeeProject,
  canSeeWorkspace,
  canSeeWorkspaceChannel,
  projectChannels,
  visibleWorkspaceChannels,
  workspaceChannels,
} from "./visibility";
import {
  channelContextValue,
  readChannelEntryContext,
  type ChannelEntryContext,
} from "./context";

export function companyChannelIdFromRequest(
  requestedChannel: string | null,
): string | undefined {
  if (!requestedChannel) return undefined;
  return channels.find(
    (channel) =>
      channel.team === "company" &&
      (channel.id === requestedChannel || channel.name === requestedChannel),
  )?.id;
}

export {
  channelContextValue,
  readChannelEntryContext,
  type ChannelEntryContext,
} from "./context";

export interface DefaultTeamsContext {
  workspaceId: string | undefined;
  departmentId: string | undefined;
  channel?: string;
  companyChannelId?: string;
}

/** Global defaults describe personal relevance, independently of ordinary content access. */
export function defaultTeamsContext(person: StaffPerson): DefaultTeamsContext {
  const role = previewRoleFor(person);
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
    canSeeDepartment(person, primary.departmentId)
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
  return {
    workspaceId: undefined,
    departmentId: undefined,
    companyChannelId: "important",
  };
}

/** One navigation model separates deliberate environment entry from a role's pinned view. */
export function channelNavigationFor({
  person,
  entryContext,
}: {
  person: StaffPerson;
  entryContext?: ChannelEntryContext;
}) {
  const legacyDepartment = departmentPreviewFor(person);
  const context =
    entryContext ||
    (legacyDepartment
      ? { kind: "department" as const, id: legacyDepartment }
      : undefined);
  const scope = channelContextValue(context);
  const role = previewRoleFor(person);
  const mode = demoMode();
  const query = (values: Record<string, string>) =>
    new URLSearchParams({
      staff: person.id,
      ...values,
      context: scope,
      ...(mode ? { demo: mode } : {}),
    });
  const company: TeamsGroup = {
    id: "company",
    kind: "company",
    label: "Company Updates",
    channels: channels
      .filter(
        (channel) =>
          channel.team === "company" &&
          ["important", "bulletin", "pets"].includes(channel.id) &&
          canAccessChannel(person, "company", channel.id),
      )
      .map((channel) => ({
        id: `company:${channel.id}`,
        label: channel.name,
        unread: ["important", "pets"].includes(channel.id),
        onSelect: () =>
          location.assign(
            `/logistics/teams?${query({ channel: channel.id, tab: "Posts" })}`,
          ),
      })),
  };
  const groups: TeamsGroup[] = [company];
  for (const workspace of workspaces) {
    const selected =
      context?.kind === "workspace" && context.id === workspace.id;
    if (!selected) continue;
    const names = selected
      ? workspaceChannels[workspace.id] || []
      : visibleWorkspaceChannels(person, workspace.id);
    if (!names.length) continue;
    groups.push({
      id: workspace.id,
      kind: "workspace",
      label: workspace.id === "logistics" ? workspaceTitle : workspace.title,
      channels: names.map((name) => {
        const content =
          workspace.id === "content" ? resolveContentChannel(name) : undefined;
        const logistics =
          workspace.id === "logistics"
            ? channels.find(
                (item) => item.team === "logistics" && item.name === name,
              )
            : undefined;
        const channelId = logistics?.id || name;
        return {
          id: `${workspace.id}:${channelId}`,
          label: name,
          unread:
            (workspace.id === "digital" && name === "AI Lab") ||
            (!!logistics &&
              ["central-city", "telephone"].includes(logistics.id)),
          private: name === "Security Engineering",
          cue:
            content?.kind === "temporary"
              ? content.lifecycle === "Archived"
                ? ("Archived" as const)
                : ("Temporary" as const)
              : undefined,
          onSelect: () =>
            location.assign(
              `${workspace.id === "logistics" ? "/logistics/teams" : "/teams"}?${query(
                {
                  ...(workspace.id === "logistics"
                    ? {}
                    : { workspace: workspace.id }),
                  channel: channelId,
                  tab:
                    workspace.id === "content"
                      ? contentDefaultTab(name)
                      : "Posts",
                },
              )}`,
            ),
        };
      }),
    });
  }
  for (const department of departments) {
    if (
      context
        ? context.kind !== "department" || context.id !== department.id
        : person.id === defaultPreviewRoleId ||
          role?.departmentId !== department.id
    )
      continue;
    groups.push({
      id: department.id,
      kind: "department",
      label: department.name,
      channels: [
        {
          id: `${department.id}:General`,
          label: "General",
          onSelect: () =>
            location.assign(
              `/teams?${query({ department: department.id, tab: "Posts" })}`,
            ),
        },
      ],
    });
  }
  for (const project of context?.kind === "project"
    ? allProjects
    : currentProjects) {
    const selected = context?.kind === "project" && context.id === project.code;
    if (context ? !selected : !isProjectPinnedForRole(person, project.code))
      continue;
    // Protected project identities/content are not advertised outside genuine entitlement.
    if (!canSeeProject(person, project.code)) continue;
    groups.push({
      id: project.code,
      kind: "project",
      label: projectTitle(project),
      channels: projectChannels.map((name) => ({
        id: `${project.code}:${name}`,
        label: name,
        private: project.access === "Restricted",
        cue: project.archived ? "Archived" : undefined,
        onSelect: () =>
          location.assign(
            `${projectHref(project)}/teams?${query({ channel: name, tab: "Posts" })}`,
          ),
      })),
    });
  }
  const incidents = initialIncidents.filter(
    (incident) =>
      canAccessEmergency(person, incident.id) &&
      (!context || (context.kind === "incident" && context.id === incident.id)),
  );
  if (incidents.length)
    groups.push({
      id: "emergency",
      kind: "emergency",
      label: "Emergency Response",
      channels: incidents.map((incident) => ({
        id: `emergency:${incident.id}`,
        label: `${incident.id} · ${incident.title}`,
        private: true,
        onSelect: () =>
          location.assign(
            `/emergency-response/incidents/${incident.id}?${query({})}`,
          ),
      })),
    });
  return {
    entryContext: context,
    groups: groups.filter((group) => group.channels.length > 0),
  };
}

export function teamsGroups(
  person: StaffPerson,
  entryContext?: ChannelEntryContext,
): TeamsGroup[] {
  return channelNavigationFor({ person, entryContext }).groups;
}

/** Opening channels never changes the colleague selected in the preview controls. */
export function teamsStaffForWorkspace(
  _workspaceId: string,
  preferredId = selectedStaffId(),
) {
  return resolveStaffPerson(preferredId).id;
}

/** Preserve deliberate destinations on role change; recheck their actual access in place. */
export function teamsPreviewHrefForStaff(
  person: StaffPerson,
  pathname: string,
  search: string,
) {
  const params = new URLSearchParams(search);
  const context = readChannelEntryContext(pathname, search);
  const selectedFolder = params.get("folder") || "";
  const selectedUnit =
    pathname === "/teams" &&
    context?.kind === "department" &&
    ["Shared", "Files"].includes(params.get("tab") || "") &&
    (unitParentFolders.includes(selectedFolder) ||
      selectedFolder === "Unit Coordination")
      ? departments
          .find((department) => department.id === context.id)
          ?.units.find((unit) => unit.id === params.get("unit"))
      : undefined;
  const selectedSection = params.get("section");
  params.set("staff", person.id);
  params.set("context", channelContextValue(context));
  for (const key of [
    "post",
    "unit",
    "section",
    "folder",
    "file",
    "document",
    "documentLibrary",
    "departmentPreview",
  ])
    params.delete(key);
  if (!context) {
    // A globally selected ordinary conversation can remain selected, with the next role's curated sidebar.
    if (
      /^\/logistics\/teams(?:\/|$)/.test(pathname) &&
      channels.some(
        (channel) =>
          channel.team === "company" && channel.id === params.get("channel"),
      )
    )
      return `${pathname}?${params}`;
    return withExplicitStaff(
      `/teams?${new URLSearchParams({ staff: person.id })}`,
      search,
    );
  }
  if (context.kind === "department") {
    params.delete("workspace");
    params.set("department", context.id);
    if (selectedUnit) {
      params.set("tab", "Shared");
      params.set(
        "folder",
        unitParentFolders.includes(selectedFolder)
          ? selectedFolder
          : unitParentFolders[0],
      );
      params.set("unit", selectedUnit.id);
      if (selectedSection && unitFolders.includes(selectedSection))
        params.set("section", selectedSection);
    }
  }
  // A newly selected role still meets the actual private/project/incident boundary in place.
  return `${pathname}?${params}`;
}
