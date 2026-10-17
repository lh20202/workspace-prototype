import type { LibraryDocument, LibraryDefinition } from "../sharepoint/library";
import { initiatives, journey, segments, type WorkingFile } from "./data";
export const libraries = [
  { id: "research", title: "Research & Insight" },
  { id: "experiments", title: "Experiments & Testing" },
  { id: "analytics", title: "Analysis & Reporting" },
];
export const libraryFor = (file: WorkingFile) =>
  file.area === "experiments"
    ? "experiments"
    : ["analytics", "decisions"].includes(file.area)
      ? "analytics"
      : "research";
export const folderFor = (file: WorkingFile) => {
  if (file.area === "research") {
    const groups: Record<string, string> = {
      "Audience Segmentation Refresh": "Audience Segmentation/Research",
      "Customer Motivation Study": "Customer Journeys/Research",
      "Competitor & Market Scan": "Competitor Research/Market Scan",
      "Website Usability Study": "UX & Usability/Website Usability Study",
      "Emerging Channel Research": "Website Behaviour/Emerging Channels",
    };
    return groups[file.folder] || file.folder;
  }
  if (file.area === "audiences")
    return file.folder === "Customer Segmentation"
      ? "Audience Segmentation/Working Models"
      : "Customer Journeys/Journey models";
  if (file.area === "experiments")
    return file.folder.includes("Channel") ||
      file.folder.includes("Channel-mix")
      ? `Channel Tests/${file.folder}`
      : `A-B Tests/${file.folder}`;
  if (file.area === "decisions") return "Recommendations/Planning handoff";
  const groups: Record<string, string> = {
    "Measurement Frameworks": "Measurement/Methods & read-outs",
    "Journey Analysis": "Measurement/Methods & read-outs",
    "Website Behaviour & UX": "Website Analysis/Conversion Study",
    "Channel Analysis": "Periodic Reports/2026 Q4",
    "Performance Analysis": "Periodic Reports/2026 Q4",
    "Experiment Results": "Measurement/Methods & read-outs",
    "Predictive Analytics": "Predictive Analysis/Retention Pilot",
    "Periodic Reporting": "Periodic Reports/2026 Q4",
  };
  return groups[file.folder] || file.folder;
};
export const documentFor = (file: WorkingFile): LibraryDocument => ({
  id: file.id,
  sensitivity: file.sensitivity,
  name: file.name,
  folder: folderFor(file),
  modified: file.modified,
  owner: file.owner,
  status: file.review,
  contentType:
    libraryFor(file) === "research"
      ? file.workType === "Research brief"
        ? "research-brief"
        : /Analysis|Findings|Synthesis/i.test(file.workType)
          ? "research-findings"
          : undefined
      : undefined,
  summary:
    file.id === "journey-map"
      ? journey
          .map(
            (step) =>
              `${step.stage}: ${step.behaviour}. ${step.friction}. ${step.test}.`,
          )
          .join(" ")
      : file.id === "seg-model"
        ? segments
            .map(
              (segment) =>
                `${segment.name}: ${segment.behaviour}; ${segment.motivation}.`,
            )
            .join(" ")
        : `${file.campaign}. ${initiatives.find((item) => item.id === file.initiativeId)?.question || ""}`,
  metadata: {
    "Work type": file.workType,
    Research: file.campaign,
    Channel:
      initiatives.find((item) => item.id === file.initiativeId)?.channel ||
      "Cross-channel",
    Period: "2026 Q4",
  },
});

export const definitions: Record<string, LibraryDefinition> = {
  research: {
    id: "research",
    name: "Research & Insight",
    columns: [
      { key: "name", label: "Name" },
      { key: "contentType", label: "Document type" },
      { key: "Research", label: "Study" },
      { key: "status", label: "Review" },
      { key: "modified", label: "Modified", type: "date" },
    ],
    fields: [
      { key: "owner", label: "Owner" },
      { key: "Channel", label: "Channel" },
    ],
    contentTypes: [
      {
        id: "research-brief",
        name: "Research Brief",
        template: "Research question, approach, scope and planned outputs.",
        fields: ["Research", "Channel"],
        defaults: { status: "Working draft" },
      },
      {
        id: "research-findings",
        name: "Research Findings",
        template: "Evidence summary, limitations and recommendations.",
        fields: ["Research", "Channel"],
        extension: "pptx",
        defaults: { status: "Ready for review" },
      },
    ],
    views: [
      { id: "all", name: "All Documents" },
      {
        id: "review",
        name: "Needs Review",
        filters: [{ field: "status", value: "review", operator: "contains" }],
        recursive: true,
      },
      { id: "by-study", name: "By Study", sortBy: "Research", recursive: true },
    ],
  },
  experiments: {
    id: "experiments",
    name: "Experiments & Testing",
    columns: [
      { key: "name", label: "Name" },
      { key: "Research", label: "Experiment" },
      { key: "Channel", label: "Channel" },
      { key: "status", label: "Review" },
      { key: "modified", label: "Modified", type: "date" },
    ],
    fields: [
      { key: "owner", label: "Owner" },
      { key: "Work type", label: "Document type" },
    ],
    views: [
      { id: "all", name: "All Documents" },
      {
        id: "review",
        name: "Needs Review",
        filters: [{ field: "status", value: "review", operator: "contains" }],
        recursive: true,
      },
      { id: "channel", name: "By Channel", sortBy: "Channel", recursive: true },
    ],
  },
  analytics: {
    id: "analytics",
    name: "Analysis & Reporting",
    columns: [
      { key: "name", label: "Name" },
      { key: "Work type", label: "Document type" },
      { key: "Period", label: "Period" },
      { key: "status", label: "Review" },
      { key: "modified", label: "Modified", type: "date" },
    ],
    fields: [
      { key: "owner", label: "Owner" },
      { key: "Research", label: "Study" },
    ],
    views: [
      { id: "all", name: "All Documents" },
      {
        id: "review",
        name: "Needs Review",
        filters: [{ field: "status", value: "review", operator: "contains" }],
        recursive: true,
      },
      { id: "period", name: "By Period", sortBy: "Period", recursive: true },
    ],
  },
};
