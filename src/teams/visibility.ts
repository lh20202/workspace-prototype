import { hasWorkspaceTeams } from "../workspaces/registry";
import type { StaffPerson } from "../intranet/catalog";
import {
  contentChannels,
  visibleContentChannels,
  canSeeContentChannel,
} from "../content/channels";
import { technicalChannels } from "../workspaces/technicalTeams";
import { channels as logisticsChannels } from "../logistics/data";

// Business site access does not imply membership of every collaboration channel.
// Company Updates and logistics General remain shared with everyone.
export const workspaceMemberships: Record<string, string[]> = {
  maya: ["logistics", "content"],
  casey: ["planning", "quality"],
  jordan: ["services", "logistics"],
  taylor: ["audience", "content"],
  alex: ["content"],
  sam: ["finance"],
  robin: ["executive", "content"],
  devon: ["digital", "services", "planning", "archives"],
  elena: ["people", "content"],
  harper: ["legal"],
  jamie: ["employment"],
};
export const logisticsChannelMemberships: Record<string, string[]> = {
  maya: ["street", "central-city", "telephone"],
  jordan: ["travel"],
  elena: ["onboarding"],
};
export const projectMemberships: Record<string, string[]> = {
  devon: ["PRJ-2026-014"],
  jordan: ["PRJ-2026-021"],
};
export const projectChannels = [
  "General",
  "Project Delivery",
  "Decisions & Actions",
];
/** Known channel names are route validation, never an access grant. */
export const workspaceChannels: Record<string, string[]> = {
  logistics: logisticsChannels
    .filter((channel) => channel.team === "logistics")
    .map((channel) => channel.name),
  planning: ["General", "Planning coordination"],
  content: contentChannels.map((channel) => channel.name),
  digital: technicalChannels,
};
const channelMemberships: Record<string, Record<string, string[]>> = {
  planning: {
    casey: ["General", "Planning coordination"],
    devon: ["General"],
  },
  digital: {
    devon: [
      "General",
      "Engineering",
      "Innovators",
      "AI Lab",
      "Platform Operations",
    ],
  },
};
export const isWorkspaceMember = (
  person: Pick<StaffPerson, "id">,
  workspaceId: string,
) =>
  workspaceId === "content"
    ? visibleContentChannels(person.id).length > 0
    : (workspaceMemberships[person.id] || []).includes(workspaceId);
export function canSeeWorkspace(
  person: Pick<StaffPerson, "id">,
  workspaceId: string,
) {
  return (
    hasWorkspaceTeams(workspaceId) &&
    (workspaceId === "logistics" || isWorkspaceMember(person, workspaceId))
  );
}
export function visibleWorkspaceChannels(
  person: Pick<StaffPerson, "id">,
  workspaceId: string,
) {
  if (!canSeeWorkspace(person, workspaceId)) return [];
  if (workspaceId === "content")
    return visibleContentChannels(person.id).map((channel) => channel.name);
  if (workspaceId === "logistics")
    return logisticsChannels
      .filter(
        (channel) =>
          channel.team === "logistics" &&
          canSeeLogisticsChannel(person, channel),
      )
      .map((channel) => channel.name);
  return channelMemberships[workspaceId]?.[person.id] || [];
}
export function canSeeWorkspaceChannel(
  person: Pick<StaffPerson, "id">,
  workspaceId: string,
  channel: string,
) {
  if (workspaceId === "content")
    return canSeeContentChannel(person.id, channel);
  return visibleWorkspaceChannels(person, workspaceId).includes(channel);
}
export const canSeeDepartment = (
  person: Pick<StaffPerson, "id" | "departmentId">,
  departmentId: string,
) => person.departmentId === departmentId;
export const canSeeProject = (
  person: Pick<StaffPerson, "id">,
  projectCode: string,
) => (projectMemberships[person.id] || []).includes(projectCode);
export function canSeeLogisticsChannel(
  person: Pick<StaffPerson, "id">,
  channel: { id: string; team: string },
) {
  return (
    channel.team === "company" ||
    (channel.team === "logistics" &&
      (channel.id === "general" ||
        (logisticsChannelMemberships[person.id] || []).includes(channel.id)))
  );
}
