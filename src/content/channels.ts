import { files, type ContentFile } from "./data";
import { canAccessChannel, previewRoles } from "../access/policy";

export interface ContentChannel {
  id: string;
  name: string;
  kind: "desk" | "topic" | "temporary";
  lifecycle: "Active" | "Archived";
  members: string[];
  purpose: string;
  focus?: "conversation" | "files" | "handoff";
  preferredLibrary?: "production" | "editorial" | "creative" | "published";
  packageIds?: string[];
  fileIds?: string[];
  areas?: string[];
  topic?: string;
}

/** Desks and short-lived coverage reflect who collaborates, not one channel per library. */
const channelDefinitions: Omit<ContentChannel, "members">[] = [
  {
    id: "editorial",
    name: "Editorial Desk",
    kind: "desk",
    lifecycle: "Active",
    areas: ["editorial"],
    focus: "conversation",
    purpose: "Story planning, working copy and editorial review.",
  },
  {
    id: "web",
    name: "Web Desk",
    kind: "desk",
    lifecycle: "Active",
    fileIds: files
      .filter((file) => file.area === "digital" || file.id === "landing-copy")
      .map((file) => file.id),
    focus: "conversation",
    purpose:
      "Page copy, accessibility and content acceptance. CMS engineering stays in Digital & Technology.",
  },
  {
    id: "social",
    name: "Social Desk",
    kind: "desk",
    lifecycle: "Active",
    areas: ["channels"],
    focus: "conversation",
    purpose: "Channel adaptations, publishing windows and social copy.",
  },
  {
    id: "media",
    name: "Media Desk",
    kind: "desk",
    lifecycle: "Active",
    packageIds: ["PKG-109"],
    focus: "conversation",
    purpose: "Public release drafting and approved publication coordination.",
  },
  {
    id: "publications",
    name: "Publications & Email",
    kind: "desk",
    lifecycle: "Active",
    focus: "files",
    preferredLibrary: "creative",
    fileIds: [
      "quarterly-draft",
      "quarterly-display",
      "print-layout",
      "print-selects",
      "welcome-message",
      "welcome-adapt",
    ],
    purpose:
      "Work through publication layouts, email copy, image selections and release checks in Shared.",
  },
  {
    id: "video",
    name: "Video & Visuals",
    kind: "desk",
    lifecycle: "Active",
    packageIds: ["PKG-103", "PKG-104", "PKG-111"],
    focus: "handoff",
    purpose: "Storyboards, review cuts, captions and accessible delivery.",
  },
  {
    id: "coordination",
    name: "Production Coordination",
    kind: "desk",
    lifecycle: "Active",
    focus: "handoff",
    purpose: "Priorities, review handoffs and the next publishing window.",
  },
  {
    id: "cities-mobility",
    name: "Cities & Mobility",
    kind: "topic",
    lifecycle: "Active",
    topic: "Cities & Mobility",
    purpose:
      "Topic specialists check city and transport context before the channel desks adapt it for publication.",
  },
  {
    id: "education-skills",
    name: "Education & Skills",
    kind: "topic",
    lifecycle: "Active",
    topic: "Education & Skills",
    purpose:
      "Bring learning and skills context into briefs, email copy and accessible explainers.",
  },
  {
    id: "digital-society",
    name: "Digital Society",
    kind: "topic",
    lifecycle: "Active",
    topic: "Digital Society",
    purpose:
      "Check public-facing language about digital services and pass useful context to Editorial and Web.",
  },
  {
    id: "arts-culture",
    name: "Arts & Culture",
    kind: "topic",
    lifecycle: "Active",
    topic: "Arts & Culture",
    purpose:
      "Review programme context and credits for print, event and multimedia production.",
  },
  // Stable IDs retain old bookmarks; their visible subjects and files have changed.
  {
    id: "coastal-flooding",
    name: "Rapid Coverage · Major Transport Disruption",
    kind: "temporary",
    lifecycle: "Active",
    packageIds: ["PKG-108"],
    purpose:
      "Editorial, topic and customer-liaison colleagues coordinate a time-sensitive public update. Operational briefings stay in their protected location.",
  },
  {
    id: "clean-water-week",
    name: "Special Coverage · City Innovation Summit",
    kind: "temporary",
    lifecycle: "Active",
    packageIds: ["PKG-113"],
    purpose:
      "Temporary city-topic and channel collaboration for the summit's public-facing coverage.",
  },
  {
    id: "community-week",
    name: "Campaign · Future Skills Week",
    kind: "temporary",
    lifecycle: "Archived",
    packageIds: ["PKG-112"],
    purpose:
      "Coverage closed on 30 September. The conversation is read-only; final outputs and delivery evidence remain in SharePoint.",
  },
];

export const contentChannels: ContentChannel[] = channelDefinitions.map(
  (channel) => ({
    ...channel,
    // Fictional collaborators remain in the post history, but selectable-role
    // membership is always derived from the central policy.
    members: previewRoles
      .filter((role) => canAccessChannel(role, "content", channel.id))
      .map((role) => role.id),
  }),
);

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
  contentChannels.filter((channel) =>
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
  const visible = visibleContentChannels(personId);
  const resolved =
    !channel || ["General", "general"].includes(channel)
      ? visible.find((item) => item.id === "coordination") || visible[0]
      : resolveContentChannel(channel);
  const name = resolved?.name || channel || "Production Coordination";
  return `/teams?${new URLSearchParams({ staff: personId, workspace: "content", channel: name, tab: contentDefaultTab(name) })}`;
}
