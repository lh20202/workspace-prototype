export const workspaces = [
  {
    id: "planning",
    title: "Organisational Planning & Reporting",
    group: "Strategy & planning",
    href: "/planning",
    icon: "strategy",
  },
  {
    id: "logistics",
    title: "Acquisition & Activation Logistics",
    group: "Campaign operations",
    href: "/logistics",
    icon: "people",
  },
  {
    id: "services",
    title: "Organisation Services",
    group: "Infrastructure & services",
    href: "/services",
    icon: "services",
  },
  {
    id: "audience",
    title: "Audience Research & Marketing Insight",
    group: "Outreach",
    href: "/audience-innovation",
    icon: "research",
  },
  {
    id: "content",
    title: "Content Creation & Delivery",
    group: "Outreach",
    href: "/content-delivery",
    icon: "content",
  },
  {
    id: "finance",
    title: "Income & Financial Operations",
    group: "Transactions & commercial services",
    href: "/financial-operations",
    icon: "finance",
  },
  {
    id: "executive",
    title: "CEO & Executive Committee",
    group: "Leadership & governance",
    href: "/executive",
    icon: "executive",
  },
];
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

const memberships: Record<string, { divisionId: string; unitId: string }> = {
  maya: {
    divisionId: "marketing-growth",
    unitId: "acquisition-and-direct-engagement",
  },
  taylor: {
    divisionId: "marketing-growth",
    unitId: "marketing-insight-and-performance",
  },
  alex: { divisionId: "communications", unitId: "editorial-and-content" },
  sam: { divisionId: "finance-services", unitId: "planning-and-analysis" },
  jordan: {
    divisionId: "finance-services",
    unitId: "procurement-and-supplier-services",
  },
  casey: {
    divisionId: "strategy-technology",
    unitId: "strategy-and-performance",
  },
  robin: { divisionId: "executive-office", unitId: "ceo-office" },
  elena: { divisionId: "people-culture", unitId: "learning-and-capability" },
};
export const staff = [
  ...baseStaff,
  {
    id: "elena",
    name: "Elena Rossi",
    role: "Learning Partner",
    workspace: "services",
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
