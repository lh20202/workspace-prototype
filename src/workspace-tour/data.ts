import type { LibraryDefinition, LibraryDocument } from "../sharepoint/library";
import type { OperationalFile } from "../logistics/data";

/** This fixture belongs only to the walkthrough; it is not a registered workspace. */
export const activityFiles: LibraryDocument[] = [
  {
    id: "activity-weekly-priorities",
    name: "Weekly priorities.docx",
    folder: "Work in progress",
    modified: "14 October 2026",
    owner: "Alex Morgan",
    status: "In review",
    sensitivity: "Internal",
    summary: "Agreed priorities, owners and next steps for the current week.",
    contentType: "Working document",
    metadata: { Workstream: "Planning", Period: "Week 42" },
    versions: [
      {
        version: "2.0",
        date: "14 October 2026",
        author: "Alex Morgan",
        note: "Added review comments and owners.",
        current: true,
      },
      {
        version: "1.0",
        date: "12 October 2026",
        author: "Jamie Brooks",
        note: "Initial draft.",
      },
    ],
  },
  {
    id: "activity-delivery-checklist",
    name: "Delivery checklist.xlsx",
    folder: "Work in progress",
    modified: "13 October 2026",
    owner: "Jamie Brooks",
    status: "Current",
    sensitivity: "Internal",
    summary: "A short checklist for coordinating this week's delivery.",
    contentType: "Checklist",
    metadata: { Workstream: "Delivery", Period: "Week 42" },
  },
  {
    id: "activity-meeting-notes",
    name: "Coordination notes.docx",
    folder: "Work in progress",
    modified: "12 October 2026",
    owner: "Riley Chen",
    status: "Draft",
    sensitivity: "Internal",
    summary:
      "Decisions and follow-up actions from the weekly coordination meeting.",
    contentType: "Meeting notes",
    metadata: { Workstream: "Coordination", Period: "Week 42" },
  },
  {
    id: "activity-template",
    name: "Project brief template.docx",
    folder: "Reference material",
    modified: "8 October 2026",
    owner: "Taylor Reed",
    status: "Approved",
    sensitivity: "Internal",
    summary: "A reusable starting point for a concise project brief.",
    contentType: "Template",
    metadata: { Workstream: "Planning", Period: "Reusable" },
  },
  {
    id: "activity-guidance",
    name: "Working together guide.pdf",
    folder: "Reference material",
    modified: "6 October 2026",
    owner: "Riley Chen",
    status: "Current",
    sensitivity: "Public",
    summary: "A quick guide to the workspace, its files and its channels.",
    contentType: "Guidance",
    metadata: { Workstream: "Coordination", Period: "Reusable" },
  },
  {
    id: "activity-summary",
    name: "Project summary.docx",
    folder: "Completed work",
    modified: "2 October 2026",
    owner: "Alex Morgan",
    status: "Approved",
    sensitivity: "Internal",
    summary: "A final summary of outcomes, decisions and follow-up work.",
    contentType: "Final record",
    metadata: { Workstream: "Delivery", Period: "October 2026" },
  },
];

export const activityFolders = [
  "Work in progress",
  "Reference material",
  "Completed work",
];

export const activityLibrary: LibraryDefinition = {
  id: "activity-workspace-files",
  name: "Working documents",
  purpose: "Shared files for current activity, reference and completed work.",
  defaultSensitivity: "Internal",
  columns: [
    { key: "name", label: "Name" },
    { key: "owner", label: "Owner" },
    { key: "status", label: "Status" },
    { key: "modified", label: "Modified", type: "date" },
  ],
  fields: [
    { key: "Workstream", label: "Workstream" },
    { key: "Period", label: "Period" },
  ],
  views: [
    {
      id: "All Documents",
      name: "All documents",
      sortBy: "name",
      columns: ["name", "owner", "sensitivity", "status", "modified"],
      recursive: true,
    },
    {
      id: "Recent documents",
      name: "Recently updated",
      sortBy: "modified",
      descending: true,
      columns: ["name", "owner", "sensitivity", "status", "modified"],
      recursive: true,
    },
    {
      id: "In review",
      name: "In review",
      filters: [{ field: "status", value: "In review" }],
      columns: ["name", "owner", "sensitivity", "status", "modified"],
      recursive: true,
    },
    {
      id: "Approved",
      name: "Approved",
      filters: [{ field: "status", value: "Approved" }],
      columns: ["name", "owner", "sensitivity", "status", "modified"],
      recursive: true,
    },
  ],
};

/** Match the existing workspace header search shape while keeping this fixture separate. */
export const activitySearchFiles = activityFiles.map((file) => ({
  ...file,
  library: "operations",
  campaign: file.metadata?.Workstream ?? "Activity",
  operation: "Shared operations",
  location: "Shared workspace",
  type: file.contentType ?? "Document",
  validFrom: "2026-10-01",
  validTo: "2026-12-31",
  recordState: "Working information",
})) as unknown as OperationalFile[];

export const activityChannels = [
  { id: "coordination", label: "Coordination", unread: true },
  { id: "updates", label: "Updates" },
  { id: "review", label: "Review" },
];
