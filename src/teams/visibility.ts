import type { StaffPerson } from "../intranet/catalog";
import {
  visibleContentChannels,
  canSeeContentChannel,
} from "../content/channels";
import { technicalChannels } from "../workspaces/technicalTeams";

// Membership is deliberately narrower than SharePoint's open internal access.
// Company Updates and the logistics General channel are shared with everyone.
export const workspaceMemberships: Record<string, string[]> = {
  maya: ["logistics", "customer"],
  casey: ["planning", "quality"],
  jordan: ["services"],
  taylor: ["audience", "content"],
  alex: ["content"],
  sam: ["finance"],
  robin: ["executive", "planning"],
  devon: ["digital", "services", "planning", "archives"],
  elena: ["people"],
  harper: ["legal"],
  jamie: ["employment"],
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
export const workspaceChannels: Record<string, string[]> = {
  planning: ["General", "Planning coordination"],
  services: ["General"],
  audience: ["General", "Research coordination"],
  content: visibleContentChannels("morgan").map((channel) => channel.name),
  employment: ["General", "Recruitment coordination"],
  finance: ["General", "Close coordination"],
  executive: ["General"],
  digital: technicalChannels,
};
export const isInformationManager = (person: Pick<StaffPerson, "id">) =>
  person.id === "morgan";
export const isWorkspaceMember = (
  person: Pick<StaffPerson, "id">,
  workspaceId: string,
) =>
  isInformationManager(person) ||
  (workspaceMemberships[person.id] || []).includes(workspaceId);
export function canSeeWorkspace(
  person: Pick<StaffPerson, "id">,
  workspaceId: string,
) {
  return (
    workspaceId === "logistics" ||
    (workspaceId === "content" &&
      visibleContentChannels(person.id).length > 0) ||
    (workspaceId !== "projects" && isWorkspaceMember(person, workspaceId))
  );
}
export function visibleWorkspaceChannels(
  person: Pick<StaffPerson, "id">,
  workspaceId: string,
) {
  if (!canSeeWorkspace(person, workspaceId)) return [];
  if (workspaceId === "content")
    return visibleContentChannels(person.id).map((channel) => channel.name);
  return (workspaceChannels[workspaceId] || ["General"]).filter(
    (name) => name !== "Security Engineering" || isInformationManager(person),
  );
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
) => isInformationManager(person) || person.departmentId === departmentId;
export const canSeeProject = (
  person: Pick<StaffPerson, "id">,
  projectCode: string,
) =>
  isInformationManager(person) ||
  (projectMemberships[person.id] || []).includes(projectCode);
export function canSeeLogisticsChannel(
  person: Pick<StaffPerson, "id">,
  channel: { id: string; team: string },
) {
  return (
    channel.team === "company" ||
    channel.id === "general" ||
    isWorkspaceMember(person, "logistics")
  );
}
