import { files, type ContentFile } from "./data";

export interface ContentChannel {
  id: string;
  name: string;
  kind: "desk" | "temporary";
  lifecycle: "Active" | "Archived";
  members: string[];
  purpose: string;
  packageIds?: string[];
  areas?: string[];
}

/** Conversation membership follows the working desk/coverage, never a file-library mirror. */
export const contentChannels: ContentChannel[] = [
  {
    id: "editorial",
    name: "Editorial Desk",
    kind: "desk",
    lifecycle: "Active",
    members: ["alex", "taylor"],
    areas: ["editorial"],
    purpose: "Story planning, working copy and editorial review.",
  },
  {
    id: "web",
    name: "Web Desk",
    kind: "desk",
    lifecycle: "Active",
    members: ["alex"],
    areas: ["digital"],
    purpose:
      "Page copy, accessibility and content acceptance. CMS engineering stays in Digital & Technology.",
  },
  {
    id: "social",
    name: "Social Desk",
    kind: "desk",
    lifecycle: "Active",
    members: ["alex"],
    areas: ["channels"],
    purpose: "Channel adaptations, publishing windows and social copy.",
  },
  {
    id: "media",
    name: "Media Desk",
    kind: "desk",
    lifecycle: "Active",
    members: ["alex"],
    packageIds: ["PKG-109"],
    purpose: "Public release drafting and approved publication coordination.",
  },
  {
    id: "video",
    name: "Video & Multimedia",
    kind: "desk",
    lifecycle: "Active",
    members: ["alex", "taylor"],
    packageIds: ["PKG-103", "PKG-104", "PKG-111"],
    purpose: "Storyboards, review cuts, captions and accessible delivery.",
  },
  {
    id: "coordination",
    name: "Production Coordination",
    kind: "desk",
    lifecycle: "Active",
    members: ["alex", "taylor"],
    purpose: "Priorities, review handoffs and the next publishing window.",
  },
  {
    id: "coastal-flooding",
    name: "Rapid Response · Coastal Flooding",
    kind: "temporary",
    lifecycle: "Active",
    members: ["alex", "taylor", "maya"],
    packageIds: ["PKG-108"],
    purpose:
      "Temporary editorial, audience and customer liaison for fictional public-information coverage. Operational briefings remain protected.",
  },
  {
    id: "clean-water-week",
    name: "Campaign Room · Clean Water Week",
    kind: "temporary",
    lifecycle: "Active",
    members: ["alex", "taylor"],
    packageIds: ["PKG-113"],
    purpose:
      "Temporary editorial and audience collaboration for the fictional Clean Water Week publishing series.",
  },
  {
    id: "community-week",
    name: "Special Coverage · Community Week",
    kind: "temporary",
    lifecycle: "Archived",
    members: ["alex"],
    packageIds: ["PKG-112"],
    purpose:
      "Coverage closed on 30 September. The conversation is read-only; final outputs and delivery evidence remain in SharePoint.",
  },
];

const aliases: Record<string, string> = {
  General: "coordination",
  "Production coordination": "coordination",
  "Editorial & Messaging": "editorial",
  "Creative Production": "video",
  "Digital Content & Experience": "web",
  general: "coordination",
  creative: "video",
  digital: "web",
};
export function resolveContentChannel(value: string) {
  return (
    contentChannels.find(
      (channel) => channel.id === value || channel.name === value,
    ) || contentChannels.find((channel) => channel.id === aliases[value])
  );
}
export const visibleContentChannels = (personId: string) =>
  contentChannels.filter(
    (channel) => personId === "morgan" || channel.members.includes(personId),
  );
export const canSeeContentChannel = (personId: string, value: string) => {
  const channel = resolveContentChannel(value);
  return (
    !!channel && (personId === "morgan" || channel.members.includes(personId))
  );
};
export const contentChannelReadOnly = (value: string) =>
  resolveContentChannel(value)?.lifecycle === "Archived";
export function contentFilesForChannel(value: string): ContentFile[] {
  const channel = resolveContentChannel(value);
  if (!channel) return [];
  return files.filter((file) =>
    channel.packageIds
      ? channel.packageIds.includes(file.packageId)
      : channel.areas
        ? channel.areas.includes(file.area)
        : true,
  );
}
export function contentTeamsHref(personId: string, channel = "coordination") {
  const resolved = resolveContentChannel(channel);
  return `/teams?${new URLSearchParams({ staff: personId, workspace: "content", channel: resolved?.name || "Production Coordination", tab: "Posts" })}`;
}
