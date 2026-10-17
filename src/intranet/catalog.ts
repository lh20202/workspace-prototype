import { workspaceRegistry } from "../workspaces/registry";
import {
  previewRoles,
  defaultPreviewRoleId,
  type PreviewRole,
} from "../access/policy";
export const workspaces = workspaceRegistry;
const baseStaff = [
  {
    id: "robin",
    name: "Robin Avery",
    role: "Executive Coordinator",
    workspace: "executive",
  },
  {
    id: "maya",
    name: "Maya Chen",
    role: "Acquisition Operations Coordinator",
    workspace: "logistics",
  },
  {
    id: "casey",
    name: "Casey Blake",
    role: "Strategic Planning Adviser",
    workspace: "planning",
  },
  {
    id: "jordan",
    name: "Jordan Lee",
    role: "Internal Services Coordinator",
    workspace: "services",
  },
  {
    id: "taylor",
    name: "Taylor Brooks",
    role: "Audience Researcher",
    workspace: "audience",
  },
  {
    id: "alex",
    name: "Alex Morgan",
    role: "Digital Content Producer",
    workspace: "content",
  },
  {
    id: "sam",
    name: "Sam Patel",
    role: "Financial Operations Analyst",
    workspace: "finance",
  },
];

const memberships: Record<string, { departmentId: string; unitId: string }> = {
  maya: {
    departmentId: "marketing-growth",
    unitId: "acquisition-and-direct-engagement",
  },
  taylor: {
    departmentId: "marketing-growth",
    unitId: "marketing-insight-and-performance",
  },
  alex: { departmentId: "communications", unitId: "editorial-and-content" },
  sam: { departmentId: "finance-services", unitId: "planning-and-analysis" },
  jordan: {
    departmentId: "finance-services",
    unitId: "procurement-and-supplier-services",
  },
  casey: {
    departmentId: "strategy-technology",
    unitId: "strategy-and-performance",
  },
  robin: { departmentId: "executive-office", unitId: "ceo-office" },
  devon: { departmentId: "strategy-technology", unitId: "it-services" },
  elena: { departmentId: "people-culture", unitId: "learning-and-capability" },
  jamie: { departmentId: "people-culture", unitId: "people-operations" },
  riley: { departmentId: "people-culture", unitId: "people-operations" },
  // Independent representation is not an HR operational department membership.
  skyler: { departmentId: "", unitId: "" },
  harper: { departmentId: "finance-services", unitId: "legal-and-assurance" },
};
export const peopleDirectory = [
  {
    id: "leonie",
    name: "Leonie Fischer",
    role: "Information Advisory Specialist",
    workspace: "digital",
    departmentId: "strategy-technology",
    unitId: "it-services",
  },
  {
    id: "riley",
    name: "Riley Quinn",
    role: "Staff Welfare Coordinator",
    workspace: "welfare",
  },
  {
    id: "skyler",
    name: "Skyler Lane",
    role: "Independent Employee Representative",
    workspace: "welfare",
  },
  ...baseStaff,
  // Ordinary conversation authors remain colleagues, never additional preview roles.
  {
    id: "nadia",
    name: "Nadia Stein",
    role: "Audience Researcher",
    workspace: "audience",
    departmentId: "marketing-growth",
    unitId: "marketing-insight-and-performance",
  },
  {
    id: "priya",
    name: "Priya Shah",
    role: "Marketing Department Assistant",
    workspace: "logistics",
    departmentId: "marketing-growth",
    unitId: "marketing-operations",
  },
  {
    id: "morgan-lee",
    name: "Morgan Lee",
    role: "Communications Department Assistant",
    workspace: "content",
    departmentId: "communications",
    unitId: "editorial-and-content",
  },
  {
    id: "hannah",
    name: "Hannah Weber",
    role: "Finance Department Assistant",
    workspace: "finance",
    departmentId: "finance-services",
    unitId: "accounting-and-control",
  },
  {
    id: "theo",
    name: "Theo Walker",
    role: "Strategy & Technology Department Assistant",
    workspace: "digital",
    departmentId: "strategy-technology",
    unitId: "strategy-and-performance",
  },
  {
    id: "clara",
    name: "Clara Jensen",
    role: "PAC Department Assistant",
    workspace: "people",
    departmentId: "people-culture",
    unitId: "people-operations",
  },
  {
    id: "jamie-reed",
    name: "Jamie Reed",
    role: "Executive Office Coordinator",
    workspace: "executive",
    departmentId: "executive-office",
    unitId: "ceo-office",
  },
  {
    id: "noor",
    name: "Noor Bennett",
    role: "Frontline Sales Coordinator",
    workspace: "logistics",
    departmentId: "marketing-growth",
    unitId: "acquisition-and-direct-engagement",
  },
  {
    id: "drew",
    name: "Drew Ellis",
    role: "Incident Response Lead",
    workspace: "digital",
    departmentId: "strategy-technology",
    unitId: "it-services",
  },
  {
    id: "alex-rowan",
    name: "Alex Rowan",
    role: "Safety Response Lead",
    workspace: "services",
    departmentId: "finance-services",
    unitId: "workplace-and-travel",
  },
  {
    id: "cameron",
    name: "Cameron Bell",
    role: "Facilities Lead",
    workspace: "services",
    departmentId: "finance-services",
    unitId: "workplace-and-travel",
  },
  {
    id: "inez",
    name: "Inez Hart",
    role: "Web Content Editor",
    workspace: "content",
    departmentId: "communications",
    unitId: "editorial-and-content",
  },
  {
    id: "rory",
    name: "Rory Bell",
    role: "Social Content Producer",
    workspace: "content",
    departmentId: "communications",
    unitId: "editorial-and-content",
  },
  {
    id: "frances",
    name: "Frances Cole",
    role: "Media Officer",
    workspace: "content",
    departmentId: "communications",
    unitId: "media-relations",
  },
  {
    id: "ari",
    name: "Ari Morgan",
    role: "M365 Engineer",
    workspace: "digital",
    departmentId: "strategy-technology",
    unitId: "it-services",
  },
  {
    id: "riley-chen",
    name: "Riley Chen",
    role: "Software Engineer",
    workspace: "digital",
    departmentId: "strategy-technology",
    unitId: "it-services",
  },
  {
    id: "jamie-brooks",
    name: "Jamie Brooks",
    role: "Acquisition Operations Lead",
    workspace: "logistics",
    departmentId: "marketing-growth",
    unitId: "acquisition-and-direct-engagement",
  },
  {
    id: "jamie",
    name: "Jamie Ellis",
    role: "Employment Operations Coordinator",
    workspace: "employment",
  },
  {
    id: "devon",
    name: "Devon Park",
    role: "Platform Engineer",
    workspace: "digital",
  },
  {
    id: "elena",
    name: "Elena Rossi",
    role: "Learning Partner",
    workspace: "people",
  },
  {
    id: "harper",
    name: "Harper Cole",
    role: "Legal Adviser",
    workspace: "legal",
  },
].map((s) => ({ ...s, ...memberships[s.id] }));
/** The company directory retains authors and focal points without making them preview identities. */
export const staff = previewRoles;
export type StaffPerson = PreviewRole;
/** A record owner/contact is not a selectable or privileged Teams identity. */
export const recordContacts = [
  { id: "morgan", name: "Morgan Reed", role: "Records Adviser" },
];
export function resolveStaffPerson(id?: string | null): StaffPerson {
  return (
    staff.find((person) => person.id === (id || selectedStaffId())) ||
    staff.find((person) => person.id === defaultPreviewRoleId)!
  );
}
export function selectedStaffId() {
  const id =
    typeof sessionStorage === "undefined"
      ? null
      : sessionStorage.getItem("workspace-preview-staff");
  return staff.some((s) => s.id === id) ? id! : defaultPreviewRoleId;
}
export function rememberStaff(id: string) {
  if (staff.some((s) => s.id === id))
    sessionStorage.setItem("workspace-preview-staff", id);
}
