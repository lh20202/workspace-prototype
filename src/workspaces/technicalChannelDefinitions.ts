/** Canonical technical channels and their ordinary/private collaboration scope. */
export const technicalChannelDefinitions = [
  { name: "General", privacy: "standard" },
  { name: "Engineering", privacy: "standard", homeFeatured: true },
  { name: "Innovators", privacy: "standard" },
  { name: "AI Lab", privacy: "standard", homeFeatured: true },
  { name: "Web & CRM DevOps", privacy: "standard" },
  { name: "M365 & SPFx", privacy: "standard", homeFeatured: true },
  { name: "Architecture & Governance", privacy: "standard" },
  { name: "Platform Operations", privacy: "standard" },
  { name: "Security Engineering", privacy: "private", homeFeatured: true },
  {
    name: "Workspace & Wiki Moderators",
    privacy: "standard",
    homeFeatured: true,
  },
] satisfies {
  name: string;
  privacy: "standard" | "private";
  homeFeatured?: boolean;
}[];

export const technicalChannels = technicalChannelDefinitions.map(
  (channel) => channel.name,
);
