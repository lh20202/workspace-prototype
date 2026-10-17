import type { FunctionalConfig, WorkingFile } from "./types";

export const publishingPurpose =
  "Coordinate the people, publishing decisions and ongoing maintenance that keep workspaces, intranet content and shared knowledge environments usable and current.";

export interface EnvironmentReview {
  id: string;
  environment: string;
  area: string;
  owner: string;
  moderator: string;
  due: string;
  status: "Needs review" | "Awaiting owner" | "In progress" | "Complete";
  action: string;
  destinationType: "Workspace" | "Intranet" | "Wiki";
  href: string;
}

/** A small action register, not a copy of each environment's content inventory. */
export const environmentReviews: EnvironmentReview[] = [
  {
    id: "PUB-101",
    environment: "Organisational Planning & Reporting",
    area: "Approved reporting link",
    owner: "Casey Blake",
    moderator: "Jordan Lee",
    due: "2026-10-20",
    status: "Needs review",
    action: "Check the intranet link against the new approved reporting view.",
    destinationType: "Intranet",
    href: "/planning/approved",
  },
  {
    id: "PUB-102",
    environment: "Sales & Marketing Wiki",
    area: "October page reviews",
    owner: "Taylor Brooks",
    moderator: "Elena Rossi",
    due: "2026-10-22",
    status: "Awaiting owner",
    action: "Confirm review owners for the three pages due this month.",
    destinationType: "Wiki",
    href: "/sales-marketing/wiki",
  },
  {
    id: "PUB-103",
    environment: "Customer Care & Relations",
    area: "Private library request",
    owner: "Maya Chen",
    moderator: "Jordan Lee",
    due: "2026-10-23",
    status: "In progress",
    action:
      "Clarify the business need against the existing protected relationship area before provisioning.",
    destinationType: "Workspace",
    href: "/customer-relations",
  },
  {
    id: "PUB-104",
    environment: "Projects",
    area: "Current Projects navigation",
    owner: "Casey Blake",
    moderator: "Devon Park",
    due: "2026-10-26",
    status: "Needs review",
    action: "Check why two closed projects still appear in the current view.",
    destinationType: "Workspace",
    href: "/projects",
  },
  {
    id: "PUB-105",
    environment: "Company intranet",
    area: "Policy and working procedure routes",
    owner: "Harper Cole",
    moderator: "Devon Park",
    due: "2026-10-27",
    status: "In progress",
    action:
      "Review navigation feedback with the content owners; refer search configuration to Digital & Technology.",
    destinationType: "Intranet",
    href: "/legal-compliance/policy",
  },
];

const fileSeeds = [
  [
    "publishing-F1",
    "workspace-reviews",
    "Workspace Review — Owner Check.docx",
    "Workspace reviews/October 2026",
    "workspace-coordination",
    "Jordan Lee",
    "In review",
    "2026-10-15",
  ],
  [
    "publishing-F2",
    "workspace-changes",
    "Workspace Request — Business Clarification.docx",
    "Changes & access questions/Customer Care",
    "workspace-coordination",
    "Jordan Lee",
    "Draft",
    "2026-10-16",
  ],
  [
    "publishing-F3",
    "navigation",
    "Findability Review — Route Notes.docx",
    "Navigation & findability/October review",
    "workspace-coordination",
    "Devon Park",
    "In review",
    "2026-10-16",
  ],
  [
    "publishing-F4",
    "improvement",
    "Environment Review — Agreed Actions.docx",
    "Review & improvement/October 2026",
    "workspace-coordination",
    "Jordan Lee",
    "Draft",
    "2026-10-14",
  ],
  [
    "publishing-F5",
    "intranet-publishing",
    "Intranet Publishing — Handoff Checklist.docx",
    "Intranet publishing/Current handoffs",
    "publishing-ownership",
    "Elena Rossi",
    "Current",
    "2026-10-12",
  ],
  [
    "publishing-F6",
    "wiki-publishing",
    "Wiki Review — Owner Follow-up.docx",
    "Wiki publishing/October reviews",
    "publishing-ownership",
    "Taylor Brooks",
    "In review",
    "2026-10-15",
  ],
  [
    "publishing-F7",
    "page-ownership",
    "Page Ownership — Responsibility Notes.docx",
    "Page ownership/Review responsibilities",
    "publishing-ownership",
    "Elena Rossi",
    "Current",
    "2026-10-13",
  ],
] as const;

const files: WorkingFile[] = fileSeeds.map(
  ([id, area, name, folder, documentLibrary, owner, status, modified]) => ({
    id,
    area,
    name,
    folder,
    folderPath: folder,
    documentLibrary,
    library: "operations",
    campaign: "Workspace, Intranet & Wiki Coordination",
    operation: "Shared operations",
    location: "Workspace, Intranet & Wiki Coordination",
    type: "docx",
    status,
    owner,
    modified,
    validFrom: "2026-10-01",
    validTo: "2026-12-31",
    sensitivity: "Internal",
    recordState: "Working information",
    workType: "Publishing coordination",
    reference: "",
    metadata: {
      Environment:
        area === "wiki-publishing"
          ? "Sales & Marketing Wiki"
          : area === "intranet-publishing" || area === "page-ownership"
            ? "Company intranet"
            : "Digital workspaces",
      "Review date": "2026-10-30",
    },
  }),
);

export const publishingConfig: FunctionalConfig = {
  id: "publishing",
  areas: [
    {
      id: "workspace-reviews",
      name: "Workspace reviews",
      summary: "Review ownership, active views and workspace upkeep.",
    },
    {
      id: "workspace-changes",
      name: "Changes & access questions",
      summary:
        "Clarify business requirements before implementation or provisioning.",
    },
    {
      id: "navigation",
      name: "Navigation & Findability",
      summary:
        "Review user feedback, routes and duplicated content with the owners.",
    },
    {
      id: "improvement",
      name: "Review & Improvement",
      summary:
        "Agree and follow through on small cross-environment improvements.",
    },
    {
      id: "intranet-publishing",
      name: "Intranet publishing",
      summary: "Coordinate editorial handoffs and publication decisions.",
    },
    {
      id: "wiki-publishing",
      name: "Wiki publishing",
      summary: "Keep knowledge pages current with their business owners.",
    },
    {
      id: "page-ownership",
      name: "Page ownership",
      summary: "Confirm publishing responsibility and review schedules.",
    },
  ],
  items: [
    {
      id: "PUB-W1",
      area: "workspace-reviews",
      name: "Planning reporting link",
      owner: "Jordan Lee",
      status: "Needs review",
      due: "2026-10-20",
      nextAction: "Confirm the intranet points to the current approved view",
      kind: "Moderation review",
    },
    {
      id: "PUB-W2",
      area: "wiki-publishing",
      name: "Wiki page review owners",
      owner: "Elena Rossi",
      status: "Awaiting input",
      due: "2026-10-22",
      nextAction: "Agree owners for three October reviews",
      kind: "Publishing review",
    },
    {
      id: "PUB-W3",
      area: "workspace-changes",
      name: "Customer Care library request",
      owner: "Jordan Lee",
      status: "In progress",
      due: "2026-10-23",
      nextAction: "Clarify the requirement before requesting technical setup",
      kind: "Business clarification",
    },
  ],
  files,
  protected: [],
  tools: [],
};
