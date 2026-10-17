import type { LibraryDefinition, LibraryDocument } from "../sharepoint/library";
import type { ExecutiveFile } from "./data";
export function folderFor(f: ExecutiveFile) {
  const folders: Record<string, string> = {
    "EX-01": "Governance submissions/October 2026",
    "EX-02": "Approved actions/October 2026",
    "EX-03": "Briefings/2027 priorities",
    "EX-04": "Stage summaries/Digital Service Renewal",
    "EX-11": "Meetings/21 October 2026",
    "EX-12": "Decision papers/2027 priorities",
    "EX-13": "Decision papers/Service transformation",
    "EX-21": "Submissions/October 2026",
    "EX-22": "Committee questions/October 2026",
    "EX-31": "Digital Service Renewal/Stage review",
    "EX-32": "Digital Service Renewal/Benefits review",
  };
  return folders[f.id] || "Shared coordination/October 2026";
}

export function executiveDocument(f: ExecutiveFile): LibraryDocument {
  return {
    id: f.id,
    sensitivity: f.sensitivity,
    name: f.name,
    folder: folderFor(f),
    owner: f.owner,
    modified: f.modified,
    status: f.status,
    contentType: /Brief|Decision|Review/.test(f.name)
      ? "meeting-brief"
      : undefined,
    metadata: {
      Activity:
        f.activity === "coordination"
          ? "Executive coordination"
          : f.activity === "initiatives"
            ? "Strategic initiatives"
            : f.activity === "oversight"
              ? "Governance liaison"
              : "Leadership meetings",
      Period: /2027/.test(f.name) ? "2027 priorities" : "October 2026",
    },
  };
}
export function executiveDefinition(activity: string): LibraryDefinition {
  return {
    id: activity,
    name: activity,
    columns: [
      { key: "name", label: "Name" },
      { key: "Period", label: "Period" },
      { key: "status", label: "Status" },
      { key: "owner", label: "Owner" },
      { key: "modified", label: "Modified", type: "date" },
    ],
    fields: [
      { key: "Activity", label: "Activity" },
      { key: "contentType", label: "Content type" },
    ],
    contentTypes: [
      {
        id: "meeting-brief",
        name: "Meeting Brief",
        template: "Purpose, decision requested, context and next action.",
        fields: ["Period", "Activity"],
      },
    ],
    views: [
      { id: "all", name: "All Documents" },
      {
        id: "current",
        name: "Current Papers",
        filters: [{ field: "status", value: "Current" }],
        recursive: true,
      },
      {
        id: "recent",
        name: "Recently Updated",
        sortBy: "modified",
        descending: true,
        recursive: true,
      },
    ],
  };
}
