import { workspaceRegistry } from "../workspaces/registry";
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
};
export const staff = [
  ...baseStaff,
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
].map((s) => ({ ...s, ...memberships[s.id] }));
export function selectedStaffId() {
  const id = sessionStorage.getItem("workspace-preview-staff");
  return staff.some((s) => s.id === id) ? id! : "maya";
}
export function rememberStaff(id: string) {
  if (staff.some((s) => s.id === id))
    sessionStorage.setItem("workspace-preview-staff", id);
}
