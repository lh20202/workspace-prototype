import { files, type ContentFile } from "./data";
import {
  canAccessChannel,
  canAccessRestrictedChannel,
  previewRoles,
  previewRoleFor,
} from "../access/policy";

import { channelDefinitions, type ContentChannel } from "./channelDefinitions";
export { channelDefinitions, type ContentChannel } from "./channelDefinitions";

export const contentChannels: ContentChannel[] = channelDefinitions.map(
  (channel) => ({
    ...channel,
    // Fictional collaborators remain in the post history, but selectable-role
    // membership is always derived from the central policy.
    members: previewRoles
      .filter((role) => canAccessRestrictedChannel(role, "content", channel.id))
      .map((role) => role.id),
  }),
);

/** A small semantic sample of desks, every topic specialist, and current coverage. */
export const contentHomeChannelGroups = () => [
  {
    id: "desks",
    label: "Channel desks",
    channels: contentChannels.filter(
      (channel) => channel.kind === "desk" && channel.homeFeatured,
    ),
  },
  {
    id: "topics",
    label: "Topic specialists",
    channels: contentChannels.filter(
      (channel) => channel.kind === "topic" && channel.lifecycle === "Active",
    ),
  },
  {
    id: "coverage",
    label: "Current coverage",
    channels: contentChannels.filter(
      (channel) =>
        channel.kind === "temporary" && channel.lifecycle === "Active",
    ),
  },
];

const aliases: Record<string, string> = {
  General: "coordination",
  "Production coordination": "coordination",
  "Editorial & Messaging": "editorial",
  "Creative Production": "video",
  "Digital Content & Experience": "web",
  "Video & Multimedia": "video",
  "Rapid Response · Coastal Flooding": "coastal-flooding",
  "Campaign Room · Clean Water Week": "clean-water-week",
  "Special Coverage · Community Week": "community-week",
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
    (channel) =>
      !!previewRoleFor(personId)?.teamChannels.content?.includes(channel.id) &&
      canAccessChannel(personId, "content", channel.id),
  );
export const canSeeContentChannel = (personId: string, value: string) => {
  const channel = resolveContentChannel(value);
  return !!channel && canAccessChannel(personId, "content", channel.id);
};
export const contentChannelReadOnly = (value: string) =>
  resolveContentChannel(value)?.lifecycle === "Archived";
export const contentDefaultTab = (value: string) =>
  resolveContentChannel(value)?.focus === "files" ? "Shared" : "Posts";
export function contentFilesForChannel(value: string): ContentFile[] {
  const channel = resolveContentChannel(value);
  if (!channel) return [];
  return files.filter((file) =>
    channel.fileIds
      ? channel.fileIds.includes(file.id)
      : channel.packageIds
        ? channel.packageIds.includes(file.packageId)
        : channel.topic
          ? file.topic === channel.topic
          : channel.areas
            ? channel.areas.includes(file.area)
            : true,
  );
}
export function contentTeamsHref(personId: string, channel?: string) {
  const resolved =
    !channel || ["General", "general"].includes(channel)
      ? resolveContentChannel("coordination")
      : resolveContentChannel(channel);
  const name = resolved?.name || channel || "Production Coordination";
  return `/teams?${new URLSearchParams({ staff: personId, workspace: "content", context: "workspace:content", channel: name, tab: contentDefaultTab(name) })}`;
}
