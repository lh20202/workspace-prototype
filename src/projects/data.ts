import { projectSeeds, historicalProjectSeeds } from "./accessClassification";
import type { SensitivityLabel } from "../sharepoint/sensitivity";
import type { LibraryDefinition, LibraryDocument } from "../sharepoint/library";
import { resolveStaffPerson } from "../intranet/catalog";
import {
  canAccessProject,
  canAccessArea,
  previewRoles,
} from "../access/policy";
export type Project = {
  code: string;
  name: string;
  purpose: string;
  area: string;
  delivery: string;
  stage: string;
  status: string;
  end: string;
  access: "Open Internal" | "Restricted";
  members: string[];
  sponsor: string;
  lead: string;
  archived?: string;
  period?: string;
};

export const currentProjects: Project[] = projectSeeds.map((s, i) => ({
  code: `PRJ-2026-${s[0]}`,
  name: s[1],
  purpose: s[2],
  area: s[3],
  delivery: s[4],
  stage: s[5],
  status: s[6],
  end: s[7],
  access: s[8] as Project["access"],
  members: previewRoles
    .filter((role) => role.projectMemberships.includes(`PRJ-2026-${s[0]}`))
    .map((role) => role.id),
  sponsor: "Robin Avery",
  lead:
    i === 0
      ? "Devon Park"
      : i === 5
        ? "Sam Patel"
        : i === 4
          ? "Elena Rossi"
          : i === 1
            ? "Jordan Lee"
            : "Casey Blake",
}));
export const archivePeriods = [
  "2024–2026 Projects",
  "2022–2025 Projects",
  "2020–2023 Projects",
  "Earlier Projects",
];

export const archivedProjects: Project[] = historicalProjectSeeds.map(
  ([code, name], i) => ({
    ...currentProjects[0],
    code: `PRJ-${code}`,
    name,
    purpose: "Completed project coordination and closure history.",
    stage: "Closed",
    status: "Closed",
    end: "2026-06-30",
    archived: i === 0 ? "Transferred to Archive" : "Closed · Read-only",
    period: archivePeriods[Math.min(3, Math.floor(i / 3))],
  }),
);
export const allProjects = [...currentProjects, ...archivedProjects];
export const projectTitle = (p: Project) => `${p.code} · ${p.name}`;
export const projectHref = (p: Project) =>
  `/projects/${p.archived ? "archive/" : ""}${p.code}`;
export const activePerson = () => resolveStaffPerson();
export const canOpenProject = (p: Project, staffId: string) =>
  canAccessProject(staffId, p.code);
export const controlRoles = previewRoles
  .filter((role) => canAccessArea(role, "projects", "control"))
  .map((role) => role.id);
export const supportRoles = previewRoles
  .filter((role) => canAccessArea(role, "projects", "support"))
  .map((role) => role.id);
export const documentNames = [
  "Project Brief.docx",
  "Delivery Plan.xlsx",
  "Design Options.pptx",
  "Stakeholder Plan.docx",
  "Transition Checklist.docx",
  "Closure Report.docx",
];
export const projectFiles = (p: Project) =>
  documentNames.map((name, i) => ({
    id: `${p.code}-F${i}`,
    name,
    projectCode: p.code,
    sensitivity: (p.access === "Restricted"
      ? "Confidential"
      : "Internal") as SensitivityLabel,
    folder:
      i === 2
        ? "Delivery/Review"
        : i >= 4
          ? "Closure/Handover"
          : "Planning/Delivery",
    owner: p.lead,
    status: p.archived ? "Closed" : i === 2 ? "In review" : "In progress",
    modified: p.archived ? p.end : `2026-10-${String(8 + i).padStart(2, "0")}`,
    contentType:
      i === 0 ? "project-brief" : i === 2 ? "stage-review" : undefined,
    metadata: { Project: p.code, Stage: p.stage, "Review date": p.end },
    summary: [
      p.purpose,
      "Coordination milestones and dependencies. Detailed engineering remains in the delivery workspace.",
      "Options for stage review and business acceptance.",
      "Roles, consultation and communication planning.",
      "Acceptance, operational readiness and outstanding actions.",
      "Closure recommendation, final records selection and benefits follow-up.",
    ][i],
  }));
export const projectAccessHref = (p: Project, personId: string) =>
  `/service-desk/access-request?${new URLSearchParams({ workspace: "Projects", project: p.code, person: personId, location: "project workspace", area: projectTitle(p) })}`;
export const reviewRows = currentProjects.map((p, i) => ({
  project: p,
  type: [
    "Stage Review",
    "Planning Review",
    "Delivery Review",
    "Initiation Review",
  ][i % 4],
  date: `2026-10-${21 + i}`,
  decision: i % 2 ? "Confirm next stage" : "Resolve dependency before delivery",
  reviewer: "Robin Avery",
  status: "Scheduled",
}));

export const projectLibraryDefinition: LibraryDefinition = {
  id: "project-documents",
  name: "Project Documents",
  columns: [
    { key: "name", label: "Name" },
    { key: "contentType", label: "Document type" },
    { key: "status", label: "Status" },
    { key: "owner", label: "Owner" },
    { key: "modified", label: "Modified", type: "date" },
  ],
  fields: [
    { key: "Project", label: "Project" },
    { key: "Stage", label: "Stage" },
    { key: "Review date", label: "Review date", type: "date" },
  ],
  contentTypes: [
    {
      id: "project-brief",
      name: "Project Brief",
      template: "Purpose, scope, sponsor, outcomes and delivery approach.",
      fields: ["Project", "Stage", "Review date"],
    },
    {
      id: "stage-review",
      name: "Stage Review",
      template: "Progress, options, risks and decision requested.",
      extension: "pptx",
      fields: ["Project", "Stage"],
    },
  ],
  views: [
    { id: "all", name: "All Documents" },
    {
      id: "review",
      name: "Needs Review",
      filters: [{ field: "status", value: "In review" }],
      recursive: true,
    },
    { id: "stage", name: "By Stage", sortBy: "Stage", recursive: true },
  ],
};

export const projectPortfolioFiles = (
  kind: "control" | "support",
  personId?: string,
): LibraryDocument[] =>
  kind === "control"
    ? [
        {
          sensitivity: "Internal",
          id: "PRJ-CONTROL-1",
          name: "Project Review Agenda.docx",
          folder: "Portfolio Reviews/October 2026",
          owner: "Casey Blake",
          modified: "16 Oct 2026",
          status: "In review",
        },
        {
          sensitivity: "Internal",
          id: "PRJ-CONTROL-2",
          name: "Stage Decision Notes.docx",
          folder: "Stage Reviews/October 2026",
          owner: "Robin Avery",
          modified: "16 Oct 2026",
          status: "Current",
        },
        {
          sensitivity: "Internal",
          id: "PRJ-CONTROL-3",
          name: "Closure Review Checklist.docx",
          folder: "Closure/2026",
          owner: "Casey Blake",
          modified: "15 Oct 2026",
          status: "Current",
        },
      ]
    : [
        currentProjects[1],
        currentProjects[3],
        currentProjects[4],
        currentProjects[6],
      ]
        .map((p, i) => ({ project: p, index: i }))
        .filter(({ project }) => !personId || canOpenProject(project, personId))
        .map(({ project: p, index: i }) => ({
          sensitivity: "Internal",
          id: `PRJ-SUPPORT-${p.code}`,
          name: [
            "Risk Workshop Agenda.docx",
            "Delivery Plan Review.docx",
            "Stage Review Notes.docx",
            "Closure Approach.docx",
          ][i],
          folder: projectTitle(p) + "/Current support",
          owner: "Casey Blake",
          modified: "16 Oct 2026",
          status: "In progress",
          summary: [
            "Facilitate the project risk workshop.",
            "Review the delivery plan with the project lead.",
            "Prepare the next stage review.",
            "Agree the closure approach and final records.",
          ][i],
        }));
