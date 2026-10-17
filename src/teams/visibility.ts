import { hasWorkspaceTeams } from "../workspaces/registry";
import type { StaffPerson } from "../intranet/catalog";
import { contentChannels, resolveContentChannel } from "../content/channels";
import { technicalChannels } from "../workspaces/technicalTeams";
import { publishingChannels } from "../workspaces/publishingTeams";
import { channels as logisticsChannels } from "../logistics/data";
import {
  previewRoles,
  canAccessChannel,
  canAccessDepartment,
  canAccessProjectTeam,
} from "../access/policy";

/** Compatibility exports are projections, never a second membership table. */
export const workspaceMemberships: Record<string, string[]> =
  Object.fromEntries(
    previewRoles.map((role) => [role.id, Object.keys(role.teamChannels)]),
  );
export const logisticsChannelMemberships: Record<string, string[]> =
  Object.fromEntries(
    previewRoles.map((role) => [role.id, role.teamChannels.logistics || []]),
  );
export const projectMemberships: Record<string, string[]> = Object.fromEntries(
  previewRoles.map((role) => [role.id, role.projectTeamMemberships]),
);
export const projectChannels = [
  "General",
  "Project Delivery",
  "Decisions & Actions",
];
/** Known channel names validate routes; the central policy still grants access. */
export const workspaceChannels: Record<string, string[]> = {
  logistics: logisticsChannels
    .filter((channel) => channel.team === "logistics")
    .map((channel) => channel.name),
  planning: ["General", "Planning coordination"],
  content: contentChannels.map((channel) => channel.name),
  digital: technicalChannels,
  publishing: publishingChannels,
};
function channelKey(workspaceId: string, value: string) {
  if (workspaceId === "content") return resolveContentChannel(value)?.id;
  if (workspaceId === "logistics")
    return logisticsChannels.find(
      (channel) =>
        channel.team === "logistics" &&
        (channel.id === value || channel.name === value),
    )?.id;
  return workspaceChannels[workspaceId]?.includes(value) ? value : undefined;
}
export const isWorkspaceMember = (
  person: Pick<StaffPerson, "id">,
  workspaceId: string,
) =>
  !!workspaceChannels[workspaceId]?.some((channel) => {
    const id = channelKey(workspaceId, channel);
    return !!id && canAccessChannel(person, workspaceId, id);
  });
export function canSeeWorkspace(
  person: Pick<StaffPerson, "id">,
  workspaceId: string,
) {
  return (
    hasWorkspaceTeams(workspaceId) && isWorkspaceMember(person, workspaceId)
  );
}
export function visibleWorkspaceChannels(
  person: Pick<StaffPerson, "id">,
  workspaceId: string,
) {
  if (!hasWorkspaceTeams(workspaceId)) return [];
  return (workspaceChannels[workspaceId] || []).filter((channel) =>
    canSeeWorkspaceChannel(person, workspaceId, channel),
  );
}
export function canSeeWorkspaceChannel(
  person: Pick<StaffPerson, "id">,
  workspaceId: string,
  channel: string,
) {
  const key = channelKey(workspaceId, channel);
  return (
    hasWorkspaceTeams(workspaceId) &&
    !!key &&
    canAccessChannel(person, workspaceId, key)
  );
}
export const canSeeDepartment = (
  person: Pick<StaffPerson, "id" | "departmentId">,
  departmentId: string,
) => canAccessDepartment(person, departmentId);
export const canSeeProject = (
  person: Pick<StaffPerson, "id">,
  projectCode: string,
) => canAccessProjectTeam(person, projectCode);
export function canSeeLogisticsChannel(
  person: Pick<StaffPerson, "id">,
  channel: { id: string; team: string },
) {
  return canAccessChannel(person, channel.team, channel.id);
}
