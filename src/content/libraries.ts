import type { LibraryDocument, LibraryDefinition } from "../sharepoint/library";
import { packages as initialPackages, type ContentFile } from "./data";
export const libraries = [
  { id: "production", title: "Current Production" },
  { id: "editorial", title: "Editorial & Messaging" },
  { id: "creative", title: "Creative & Multimedia" },
  { id: "published", title: "Published & Final Content" },
];
const currentPackages = [
  "PKG-101",
  "PKG-102",
  "PKG-103",
  "PKG-104",
  "PKG-105",
  "PKG-108",
  "PKG-113",
];
export const libraryFor = (file: ContentFile) =>
  initialPackages.find((item) => item.id === file.packageId)?.stage === "Closed"
    ? "published"
    : currentPackages.includes(file.packageId)
      ? "production"
      : file.area === "editorial"
        ? "editorial"
        : "creative";
export const folderFor = (file: ContentFile) => {
  if (libraryFor(file) === "published") return `2026/${file.campaign}`;
  if (libraryFor(file) === "production") {
    // A working set stays together; a separate review area is worthwhile only
    // for the video's paired storyboard/review-cut handoff, not every file type.
    const section =
      file.packageId === "PKG-103" && file.area === "creative"
        ? "Creative & Review"
        : "Working Copy";
    return `${file.campaign}/${section}`;
  }
  if (libraryFor(file) === "editorial") {
    const group =
      file.packageId === "PKG-106"
        ? "Audience Updates"
        : file.packageId === "PKG-107"
          ? "Customer Stories"
          : file.packageId === "PKG-109"
            ? "Media Releases"
            : file.packageId === "PKG-111"
              ? "Audio"
              : "Public Information";
    return `${group}/${file.campaign}`;
  }
  const group =
    file.area === "digital"
      ? "Website & Digital"
      : file.packageId === "PKG-110"
        ? "Print"
        : file.packageId === "PKG-106"
          ? "Presentations"
          : file.packageId === "PKG-107"
            ? "Storytelling"
            : file.packageId === "PKG-108"
              ? "Public Information"
              : "Campaign Formats";
  return `${group}/${file.campaign}`;
};
export const documentFor = (file: ContentFile): LibraryDocument => {
  const item = initialPackages.find((item) => item.id === file.packageId)!;
  return {
    id: file.id,
    name: file.name,
    folder: folderFor(file),
    modified: file.modified,
    owner: file.owner,
    status: file.review,
    contentType:
      libraryFor(file) === "published"
        ? "published-output"
        : libraryFor(file) === "production"
          ? /brief/i.test(file.workType)
            ? "content-brief"
            : "production-asset"
          : undefined,
    summary: `${item.purpose}. ${item.testing} ${item.condition}`,
    metadata: {
      Production: file.campaign,
      Channel: item.channels.join(", "),
      "Work type": file.workType,
      Rights: item.rights,
      "Review due": item.reviewDue,
      "Release date": item.releaseDate,
    },
  };
};

export const definitions: Record<string, LibraryDefinition> = {
  production: {
    id: "production",
    name: "Current Production",
    columns: [
      { key: "name", label: "Name" },
      { key: "Channel", label: "Channel" },
      { key: "status", label: "Review" },
      { key: "owner", label: "Owner" },
      { key: "Review due", label: "Review due", type: "date" },
    ],
    fields: [
      { key: "Production", label: "Production" },
      { key: "Rights", label: "Rights" },
      { key: "contentType", label: "Content type" },
    ],
    contentTypes: [
      {
        id: "content-brief",
        name: "Content Brief",
        template: "Audience, purpose, message, format and approval route.",
        fields: ["Production", "Channel", "Review due"],
      },
      {
        id: "production-asset",
        name: "Production Asset",
        template: "Asset requirements, accessibility and release checks.",
        fields: ["Production", "Channel", "Rights"],
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
      { id: "channel", name: "By Channel", sortBy: "Channel", recursive: true },
    ],
  },
  editorial: {
    id: "editorial",
    name: "Editorial & Messaging",
    columns: [
      { key: "name", label: "Name" },
      { key: "Work type", label: "Document type" },
      { key: "status", label: "Review" },
      { key: "owner", label: "Owner" },
      { key: "modified", label: "Modified", type: "date" },
    ],
    fields: [
      { key: "Production", label: "Production" },
      { key: "Review due", label: "Review due", type: "date" },
    ],
    views: [
      { id: "all", name: "All Documents" },
      {
        id: "review",
        name: "Needs Review",
        filters: [{ field: "status", value: "review", operator: "contains" }],
        recursive: true,
      },
      {
        id: "production",
        name: "By Production",
        sortBy: "Production",
        recursive: true,
      },
    ],
  },
  published: {
    id: "published",
    name: "Published & Final Content",
    purpose:
      "Final production outputs and delivery evidence retained after coverage closes.",
    columns: [
      { key: "name", label: "Name" },
      { key: "Production", label: "Production" },
      { key: "Channel", label: "Channel" },
      { key: "Release date", label: "Released", type: "date" },
      { key: "Rights", label: "Reuse rights" },
    ],
    fields: [
      { key: "owner", label: "Owner" },
      { key: "status", label: "Status" },
      { key: "contentType", label: "Content type" },
    ],
    contentTypes: [
      {
        id: "published-output",
        name: "Published Output",
        template:
          "Final approved output, publication reference and reuse conditions.",
        fields: ["Production", "Release date", "Rights"],
      },
    ],
    views: [
      { id: "all", name: "All Documents" },
      {
        id: "released",
        name: "By Release Date",
        sortBy: "Release date",
        descending: true,
        recursive: true,
      },
      {
        id: "production",
        name: "By Production",
        sortBy: "Production",
        recursive: true,
      },
    ],
  },
  creative: {
    id: "creative",
    name: "Creative & Multimedia",
    columns: [
      { key: "name", label: "Name" },
      { key: "Channel", label: "Channel" },
      { key: "status", label: "Review" },
      { key: "Rights", label: "Rights" },
      { key: "modified", label: "Modified", type: "date" },
    ],
    fields: [
      { key: "owner", label: "Owner" },
      { key: "Production", label: "Production" },
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
};
