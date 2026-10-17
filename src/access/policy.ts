/**
 * Fictional preview entitlements. This is the only source of role membership;
 * product views and Teams adapters ask the same policy rather than inferring
 * business access from a job title, seniority or technical administration.
 */
export type TeamsLanding =
  | { kind: "workspace"; workspaceId: string; channelId: string }
  | { kind: "department"; departmentId: string }
  | { kind: "company"; channelId: string };

export interface PreviewRole {
  id: string;
  name: string;
  role: string;
  workspace: string;
  departmentId: string;
  unitId: string;
  workspaceMemberships: string[];
  restrictedAreas: Record<string, string[]>;
  teamChannels: Record<string, string[]>;
  teamsLanding: TeamsLanding;
  projectMemberships: string[];
  projectTeamMemberships: string[];
  temporaryTeamMemberships: string[];
  emergencyMemberships: string[];
}

const ordinaryWorkspaces = [
  "planning",
  "projects",
  "quality",
  "legal",
  "services",
  "archives",
  "people",
  "finance",
  "logistics",
  "customer",
];

export const defaultPreviewRoleId = "taylor";
export const previewRoles: PreviewRole[] = [
  {
    id: "taylor",
    name: "Taylor Brooks",
    role: "General Staff Member",
    workspace: "audience",
    departmentId: "marketing-growth",
    unitId: "marketing-insight-and-performance",
    workspaceMemberships: [...ordinaryWorkspaces, "audience", "content"],
    restrictedAreas: {},
    teamChannels: {},
    teamsLanding: { kind: "department", departmentId: "marketing-growth" },
    projectMemberships: ["PRJ-2026-021", "PRJ-2026-031", "PRJ-2024-018"],
    projectTeamMemberships: [],
    temporaryTeamMemberships: [],
    emergencyMemberships: [],
  },
  {
    id: "maya",
    name: "Maya Chen",
    role: "Frontline Sales Adviser",
    workspace: "logistics",
    departmentId: "marketing-growth",
    unitId: "acquisition-and-direct-engagement",
    workspaceMemberships: [...ordinaryWorkspaces],
    restrictedAreas: {},
    teamChannels: {
      logistics: ["general", "street", "central-city", "telephone"],
    },
    teamsLanding: {
      kind: "workspace",
      workspaceId: "logistics",
      channelId: "general",
    },
    projectMemberships: ["PRJ-2026-014"],
    projectTeamMemberships: ["PRJ-2026-014"],
    temporaryTeamMemberships: [],
    emergencyMemberships: [],
  },
  {
    id: "robin",
    name: "Robin Avery",
    role: "Executive Director",
    workspace: "executive",
    departmentId: "executive-office",
    unitId: "ceo-office",
    workspaceMemberships: [
      ...ordinaryWorkspaces,
      "executive",
      "content",
      "governance",
    ],
    restrictedAreas: {
      executive: [
        "home",
        "coordination",
        "leadership",
        "oversight",
        "initiatives",
        "decisions",
        "calendar",
        "SI-01",
        "SI-02",
      ],
      planning: ["restricted"],
      projects: ["control", "reviews"],
      governance: ["approved", "liaison", "outputs"],
    },
    teamChannels: {
      planning: ["General", "Planning coordination"],
    },
    teamsLanding: { kind: "department", departmentId: "executive-office" },
    projectMemberships: [
      "PRJ-2026-014",
      "PRJ-2026-027",
      "PRJ-2026-038",
      "PRJ-2025-007",
    ],
    projectTeamMemberships: ["PRJ-2026-027"],
    temporaryTeamMemberships: [],
    emergencyMemberships: ["INC-104", "INC-099"],
  },
  {
    id: "jamie",
    name: "Jamie Ellis",
    role: "Personnel Administrator",
    workspace: "employment",
    departmentId: "people-culture",
    unitId: "people-operations",
    workspaceMemberships: [...ordinaryWorkspaces, "employment", "welfare"],
    restrictedAreas: {
      employment: [
        "candidate-applications",
        "candidate-assessments",
        "references",
        "offers",
        "employee-records",
        "employment-changes",
        "employee-master-data",
        "absence-administration",
      ],
      welfare: ["welfare-support", "approved-consultation"],
    },
    teamChannels: {},
    teamsLanding: { kind: "department", departmentId: "people-culture" },
    projectMemberships: ["PRJ-2026-034", "PRJ-2023-019"],
    projectTeamMemberships: ["PRJ-2026-034"],
    temporaryTeamMemberships: [],
    emergencyMemberships: ["INC-107"],
  },
  {
    id: "devon",
    name: "Devon Park",
    role: "Technology & Engineering Administrator",
    workspace: "digital",
    departmentId: "strategy-technology",
    unitId: "it-services",
    workspaceMemberships: [...ordinaryWorkspaces, "digital", "publishing"],
    restrictedAreas: {
      digital: ["security", "privileged-access", "production", "recovery"],
    },
    teamChannels: {
      digital: [
        "General",
        "Engineering",
        "Innovators",
        "AI Lab",
        "Web & CRM DevOps",
        "M365 & SPFx",
        "Architecture & Governance",
        "Platform Operations",
        "Security Engineering",
      ],
      publishing: [
        "General",
        "Workspace Moderation",
        "Intranet Moderation",
        "Wiki Moderation",
        "Publishing & Ownership",
        "Navigation & Findability",
      ],
    },
    teamsLanding: {
      kind: "workspace",
      workspaceId: "digital",
      channelId: "Engineering",
    },
    projectMemberships: ["PRJ-2026-014", "PRJ-2026-042", "PRJ-2020-006"],
    projectTeamMemberships: ["PRJ-2026-014", "PRJ-2026-042"],
    temporaryTeamMemberships: [],
    emergencyMemberships: ["INC-104"],
  },
];

export type PolicyPerson = string | { id: string };
export function previewRoleFor(person: PolicyPerson) {
  const id = typeof person === "string" ? person : person.id;
  return previewRoles.find((role) => role.id === id);
}

export function canAccessWorkspace(person: PolicyPerson, workspaceId: string) {
  return !!previewRoleFor(person)?.workspaceMemberships.includes(workspaceId);
}

/** Protected subject IDs stay distinct from ordinary library/area IDs. */
const protectedAreas: Record<string, string[]> = {
  projects: ["control", "reviews"],
  services: ["live-tender", "negotiation", "visitor-arrangements"],
  digital: [
    "security",
    "privileged-access",
    "credentials",
    "vulnerabilities",
    "production",
    "restricted-web",
    "recovery",
    "protected",
  ],
  legal: [
    "privileged",
    "disputes",
    "privacy-incidents",
    "investigations",
    "formal-cases",
    "sensitive-risk",
  ],
  people: ["network-membership"],
  employment: [
    "payroll-inputs",
    "absence-administration",
    "employee-master-data",
    "candidate-applications",
    "candidate-assessments",
    "references",
    "offers",
    "placement",
    "employee-records",
    "employment-changes",
    "compensation",
    "protected",
  ],
  customer: [
    "platinum",
    "customer-cases",
    "commercial-account",
    "relationships",
    "premium",
    "accounts",
    "partnerships",
    "stakeholders",
    "meetings",
  ],
  archives: ["historical"],
  planning: ["restricted"],
  audience: [
    "participant-administration",
    "raw-data",
    "participant-data",
    "restricted",
    "pre-decision",
  ],
  content: [
    "participant-administration",
    "pre-release-briefing",
    "embargoed-distribution",
    "commercial-proposal",
    "restricted",
    "pre-release",
    "rights-restricted",
  ],
  finance: [
    "protected",
    "individual-income",
    "refunds",
    "bank-details",
    "payroll",
    "sensitive-adjustment",
    "restricted-forecast",
    "liquidity-model",
    "payment-exceptions",
    "refund-chargeback",
    "high-value-payment",
    "payment-data-correction",
    "payroll-settlement",
    "employee-reimbursements",
    "disputed-supplier-payment",
    "exceptional-authorisation",
    "draft-scenarios",
    "workforce-cost",
    "restructuring-cost",
    "investment-affordability",
    "pre-decision",
    "tax-working-papers",
    "external-audit",
    "accounting-investigation",
    "pre-issue-statements",
    "bank-mandates",
    "signatories",
    "liquidity-stress",
    "transfer-authorisation",
    "banking-security",
    "restricted-planning",
  ],
};

/** Finite ordinary areas make unknown protected URLs fail closed as well. */
const ordinaryAreas: Record<string, string[]> = {
  services: ["office", "purchasing", "travel", "reception"],
  quality: ["monitoring", "process", "improvement", "eco", "reviews"],
  digital: [
    "engineering",
    "web-crm",
    "systems-engineering",
    "ai-automation",
    "m365",
    "information-architecture",
    "architecture",
    "operations",
    "protected",
  ],
  legal: [
    "review",
    "privacy",
    "compliance",
    "risk",
    "contracts",
    "audit",
    "policy",
  ],
  people: [
    "workforce",
    "culture",
    "learning",
    "frameworks",
    "communications",
    "communities",
    "analytics",
    "wellbeing",
  ],
  employment: ["hiring", "employment", "inputs", "protected"],
  customer: [
    "care",
    "relationships",
    "premium",
    "accounts",
    "partnerships",
    "stakeholders",
    "meetings",
    "quality",
  ],
  archives: [
    "collections",
    "legacy-drive",
    "global",
    "retention",
    "transfer",
    "cataloguing",
    "preservation",
    "access",
    "projects",
  ],
  planning: [
    "home",
    "planning",
    "strategy",
    "performance",
    "approved",
    "department-submissions",
  ],
  audience: [
    "home",
    "automation",
    "research",
    "audiences",
    "experiments",
    "analytics",
    "decisions",
    "calendar",
  ],
  content: [
    "home",
    "editorial",
    "creative",
    "digital",
    "channels",
    "production",
    "published",
    "calendar",
    "packages",
    "partners",
    "topics",
  ],
  finance: [
    "home",
    "income",
    "reconciliation",
    "payments",
    "planning",
    "accounting",
    "treasury",
    "calendar",
  ],
  logistics: [
    "home",
    "operations",
    "resources",
    "training",
    "records",
    "calendar",
    "locations",
    "rota",
  ],
  projects: ["home", "control", "support", "reviews"],
  publishing: [
    "workspace-reviews",
    "workspace-changes",
    "navigation",
    "improvement",
    "intranet-publishing",
    "wiki-publishing",
    "page-ownership",
  ],
};

export function canAccessArea(
  person: PolicyPerson,
  workspaceId: string,
  areaId: string,
) {
  const role = previewRoleFor(person);
  if (!role || !canAccessWorkspace(role, workspaceId)) return false;
  if (
    workspaceId === "welfare" ||
    workspaceId === "governance" ||
    workspaceId === "executive"
  )
    return !!role.restrictedAreas[workspaceId]?.includes(areaId);
  if (protectedAreas[workspaceId]?.includes(areaId))
    return !!role.restrictedAreas[workspaceId]?.includes(areaId);
  return !!ordinaryAreas[workspaceId]?.includes(areaId);
}

export function canAccessWikiArea(person: PolicyPerson, areaId: string) {
  const role = previewRoleFor(person);
  if (!role) return false;
  return areaId === "insight"
    ? ["taylor", "robin"].includes(role.id)
    : [
        "foundations",
        "messaging",
        "standards",
        "learning",
        "tools",
        "contacts",
        "a-z",
      ].includes(areaId);
}
export const canAccessPortal = (person: PolicyPerson) =>
  previewRoleFor(person)?.id === "maya";
export const canAccessProject = (person: PolicyPerson, projectId: string) =>
  !!previewRoleFor(person)?.projectMemberships.includes(projectId);
export const canAccessProjectTeam = (person: PolicyPerson, projectId: string) =>
  !!previewRoleFor(person)?.projectTeamMemberships.includes(projectId);
export const canAccessDepartment = (
  person: PolicyPerson,
  departmentId: string,
) => previewRoleFor(person)?.departmentId === departmentId;
export function canAccessUnit(
  person: PolicyPerson,
  departmentId: string,
  unitId: string,
  unitOnly = true,
) {
  const role = previewRoleFor(person);
  return (
    !!role &&
    canAccessDepartment(role, departmentId) &&
    (!unitOnly || role.unitId === unitId)
  );
}
export function canAccessChannel(
  person: PolicyPerson,
  workspaceId: string,
  channelId: string,
) {
  const role = previewRoleFor(person);
  if (!role) return false;
  if (workspaceId === "company")
    return [
      "important",
      "bulletin",
      "office",
      "pets",
      "learning",
      "socials",
    ].includes(channelId);
  const canonicalChannel =
    workspaceId === "logistics" && channelId === "General"
      ? "general"
      : channelId;
  return !!role.teamChannels[workspaceId]?.includes(canonicalChannel);
}
export const canAccessEmergency = (person: PolicyPerson, incidentId: string) =>
  !!previewRoleFor(person)?.emergencyMemberships.includes(incidentId);

export type AccessResource =
  | { kind: "workspace"; workspaceId: string }
  | { kind: "area"; workspaceId: string; areaId: string }
  | { kind: "wiki"; areaId: string }
  | { kind: "portal" }
  | { kind: "project"; projectId: string }
  | { kind: "project-team"; projectId: string }
  | { kind: "channel"; workspaceId: string; channelId: string }
  | { kind: "department"; departmentId: string }
  | { kind: "emergency"; incidentId: string };

export function resourceAccess(person: PolicyPerson, resource: AccessResource) {
  switch (resource.kind) {
    case "workspace":
      return canAccessWorkspace(person, resource.workspaceId);
    case "area":
      return canAccessArea(person, resource.workspaceId, resource.areaId);
    case "wiki":
      return canAccessWikiArea(person, resource.areaId);
    case "portal":
      return canAccessPortal(person);
    case "project":
      return canAccessProject(person, resource.projectId);
    case "project-team":
      return canAccessProjectTeam(person, resource.projectId);
    case "channel":
      return canAccessChannel(person, resource.workspaceId, resource.channelId);
    case "department":
      return canAccessDepartment(person, resource.departmentId);
    case "emergency":
      return canAccessEmergency(person, resource.incidentId);
  }
}
export const allowedPreviewRoles = (resource: AccessResource) =>
  previewRoles.filter((role) => resourceAccess(role, resource));
/** A role cue requires entitlement to the precise denied destination. */
export function hasAlternativePreviewAccess(
  resource: AccessResource,
  currentId: string,
) {
  return (
    resource.kind !== "department" &&
    !resourceAccess(currentId, resource) &&
    allowedPreviewRoles(resource).some((role) => role.id !== currentId)
  );
}
