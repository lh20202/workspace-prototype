import type { FunctionalConfig, WorkingFile } from "./types";
import {
  canAccessArea,
  canAccessWorkspace,
  previewRoles,
} from "../access/policy";

export const welfareTitle = "Welfare";
export const welfareHref = "/welfare-representation";
export const welfareAreas = [
  {
    id: "welfare-support",
    name: "Welfare & Psychosocial Support",
    summary: "Working methods and non-identifiable support-path coordination.",
    participants: ["jamie"],
    contact: "riley",
  },
  {
    id: "safeguarding-complaints",
    name: "Safeguarding & Complaints",
    summary:
      "Reporting routes, referral responsibilities and aggregate process review.",
    participants: [],
    contact: "riley",
  },
  {
    id: "employee-representation",
    name: "Employee Representation",
    summary:
      "Independent representative working methods and consultation preparation.",
    participants: [],
    contact: "skyler",
  },
];
export const consultationArea = {
  id: "approved-consultation",
  name: "Approved consultation outputs",
  summary:
    "Agreed, non-identifiable outputs shared across the protected areas.",
};
export const welfareParticipants = previewRoles
  .filter((role) => canAccessWorkspace(role, "welfare"))
  .map((role) => role.id);
export const canSeeWelfareWorkspace = (personId: string) =>
  canAccessWorkspace(personId, "welfare");
export const canSeeWelfareArea = (personId: string, areaId: string) =>
  canAccessArea(personId, "welfare", areaId);
export const visibleWelfareAreas = (personId: string) =>
  welfareAreas.filter((area) => canSeeWelfareArea(personId, area.id));

function methodFile(
  id: string,
  area: string,
  name: string,
  owner: string,
): WorkingFile {
  const approved = area === consultationArea.id;
  return {
    id,
    area,
    name,
    folder: approved
      ? "Approved outputs/2026 consultation"
      : "Working methods/Current",
    folderPath: approved
      ? "Approved outputs/2026 consultation"
      : "Working methods/Current",
    documentLibrary: area,
    contentType: approved
      ? "Approved Consultation Output"
      : "Protected Working Method",
    workType: approved ? "Approved consultation" : "Working method",
    reference: "",
    library: "operations",
    campaign: welfareTitle,
    operation: "Shared operations",
    location: welfareTitle,
    type: "docx",
    status: "Current",
    owner,
    validFrom: "2026-10-01",
    validTo: "2027-03-31",
    modified: "2026-10-14",
    sensitivity: "Strictly confidential",
    recordState: "Working information",
    metadata: { Scope: "Methods and non-identifiable coordination only" },
  };
}

/** Canonical ownership only: no case dossiers, individual records or duplicate HR fixtures. */
export const welfareConfig: FunctionalConfig = {
  id: "welfare",
  areas: [
    ...welfareAreas.map(({ id, name, summary }) => ({ id, name, summary })),
    consultationArea,
  ],
  items: [
    {
      id: "WELFARE-101",
      area: "welfare-support",
      name: "Support pathway review",
      nextAction:
        "Review referral responsibilities and aggregate service themes",
      owner: "Riley Quinn",
      status: "In progress",
      due: "2026-10-30",
      kind: "Non-identifiable coordination",
    },
    {
      id: "WELFARE-102",
      area: "safeguarding-complaints",
      name: "Reporting route review",
      nextAction: "Check reporting routes and separation of responsibilities",
      owner: "Riley Quinn",
      status: "Needs review",
      due: "2026-10-30",
      kind: "Process review",
    },
    {
      id: "WELFARE-103",
      area: "employee-representation",
      name: "Representative consultation cycle",
      nextAction: "Agree the independent review timetable and approved outputs",
      owner: "Skyler Lane",
      status: "In progress",
      due: "2026-10-30",
      kind: "Independent consultation",
    },
  ],
  files: [
    methodFile(
      "welfare-methods",
      "welfare-support",
      "Support Pathways — Working Method.docx",
      "Riley Quinn",
    ),
    methodFile(
      "safeguarding-methods",
      "safeguarding-complaints",
      "Reporting & Referral — Working Method.docx",
      "Riley Quinn",
    ),
    methodFile(
      "representation-methods",
      "employee-representation",
      "Independent Consultation — Preparation Method.docx",
      "Skyler Lane",
    ),
    methodFile(
      "consultation-output",
      consultationArea.id,
      "Agreed Consultation Principles.docx",
      "Authorised consultation participants",
    ),
  ],
  protected: welfareAreas.map(({ id, name }) => ({
    id,
    name,
    area: id,
    strict: true,
  })),
  tools: [],
};
export const welfareFilesForPerson = (personId: string) =>
  welfareConfig.files.filter((file) => canSeeWelfareArea(personId, file.area));

/** Migrated subjects retain a single owner; broad, open wellbeing programmes stay in People. */
export function legacyWelfareDestination(path: string): string | undefined {
  if (/^\/employee-council(?:\/|$)/.test(path))
    return `${welfareHref}/employee-representation`;
  if (!/^\/(people-culture|employment-admin|services)(?:\/|$)/.test(path))
    return;
  const parts = path.split("/").filter(Boolean).slice(1);
  if (
    path.startsWith("/services/") &&
    ![
      "hiring",
      "people",
      "employment",
      "protected",
      "welfare",
      "safeguarding",
      "employee-representation",
    ].includes(parts[0])
  )
    return;
  if (
    parts.some((part) =>
      [
        "employee-representation",
        "representation",
        "representation-cases",
        "consultation",
        "deliberations",
        "co-determination",
      ].includes(part),
    )
  )
    return `${welfareHref}/employee-representation`;
  if (
    parts.some((part) =>
      [
        "complaints",
        "safeguarding",
        "investigations",
        "employee-relations",
      ].includes(part),
    )
  )
    return `${welfareHref}/safeguarding-complaints`;
  if (
    parts.some((part) =>
      [
        "welfare",
        "psychosocial",
        "wellbeing-support",
        "duty-of-care",
        "staff-support",
        "support-cases",
      ].includes(part),
    )
  )
    return `${welfareHref}/welfare-support`;
}
