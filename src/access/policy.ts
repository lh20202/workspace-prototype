import { workspaceAccessLevels } from "../workspaces/accessClassification";
import { projectAccessLevels } from "../projects/accessClassification";
import { channelDefinitions } from "../content/channelDefinitions";
import { technicalChannelDefinitions } from "../workspaces/technicalChannelDefinitions";
import { channels as operationalChannels } from "../logistics/data";
import { planningChannels } from "../planning/channels";

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
  /** Daily channels shown in the curated Teams navigation. */
  teamChannels: Record<string, string[]>;
  /** Occasional collaboration membership, available by direct link but not pinned. */
  additionalChannelAccess?: Record<string, string[]>;
  teamsLanding: TeamsLanding;
  projectMemberships: string[];
  projectTeamMemberships: string[];
  temporaryTeamMemberships: string[];
  emergencyMemberships: string[];
  /** Temporary, route-scoped Department preview; never a stored membership. */
  departmentPreviewId?: string;
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
    teamsLanding: { kind: "company", channelId: "important" },
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
      planning: ["General", "Planning coordination", "Planning & Reporting"],
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
    workspaceMemberships: [...ordinaryWorkspaces, "digital"],
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
        "Workspace & Wiki Moderators",
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
  {
    id: "leonie",
    name: "Leonie Fischer",
    role: "Information Advisory Specialist",
    workspace: "digital",
    departmentId: "strategy-technology",
    unitId: "it-services",
    workspaceMemberships: [
      ...ordinaryWorkspaces,
      "audience",
      "content",
      "digital",
    ],
    restrictedAreas: {},
    teamChannels: {
      digital: [
        "M365 & SPFx",
        "Architecture & Governance",
        "Workspace & Wiki Moderators",
      ],
    },
    teamsLanding: {
      kind: "workspace",
      workspaceId: "digital",
      channelId: "Workspace & Wiki Moderators",
    },
    projectMemberships: [],
    projectTeamMemberships: [],
    temporaryTeamMemberships: [],
    emergencyMemberships: [],
  },
  {
    id: "nadia",
    name: "Nadia Stein",
    role: "Sales & Marketing Specialist",
    workspace: "content",
    departmentId: "marketing-growth",
    unitId: "marketing-insight-and-performance",
    workspaceMemberships: [...ordinaryWorkspaces, "audience", "content"],
    restrictedAreas: {},
    teamChannels: { content: ["coordination", "editorial", "social"] },
    additionalChannelAccess: {
      content: ["cities-mobility", "education-skills", "clean-water-week"],
    },
    teamsLanding: {
      kind: "workspace",
      workspaceId: "content",
      channelId: "coordination",
    },
    projectMemberships: [],
    projectTeamMemberships: [],
    temporaryTeamMemberships: [],
    emergencyMemberships: [],
  },
  {
    id: "sam",
    name: "Sam Patel",
    role: "Finance Operations Specialist",
    workspace: "finance",
    departmentId: "finance-services",
    unitId: "accounting-and-control",
    workspaceMemberships: [...ordinaryWorkspaces],
    restrictedAreas: { finance: ["payment-exceptions", "refund-chargeback"] },
    teamChannels: { planning: ["Planning & Reporting"] },
    teamsLanding: { kind: "department", departmentId: "finance-services" },
    projectMemberships: [],
    projectTeamMemberships: [],
    temporaryTeamMemberships: [],
    emergencyMemberships: [],
  },
  {
    id: "elliot",
    name: "Elliot Stone",
    role: "Site Administrator",
    workspace: "digital",
    departmentId: "strategy-technology",
    unitId: "it-services",
    workspaceMemberships: [
      ...ordinaryWorkspaces,
      "audience",
      "content",
      "digital",
    ],
    restrictedAreas: {},
    teamChannels: {
      digital: [
        "M365 & SPFx",
        "Architecture & Governance",
        "Workspace & Wiki Moderators",
      ],
    },
    teamsLanding: {
      kind: "workspace",
      workspaceId: "digital",
      channelId: "M365 & SPFx",
    },
    projectMemberships: [],
    projectTeamMemberships: [],
    temporaryTeamMemberships: [],
    emergencyMemberships: [],
  },
];

export const previewRoleGroups = [
  {
    label: "GENERAL / BUSINESS",
    roleIds: ["taylor", "nadia", "maya", "sam", "robin", "jamie"],
  },
  { label: "SPECIALIST / ADMIN", roleIds: ["devon", "leonie", "elliot"] },
] as const;
export const canAdministerSites = (person: PolicyPerson) =>
  ["elliot", "leonie"].includes(previewRoleFor(person)?.id || "");

/** Delegated site ownership never grants access to protected business content. */
export const canManageSiteSettings = (
  person: PolicyPerson,
  workspaceId: string,
) => canAdministerSites(person) && canAccessWorkspace(person, workspaceId);
export type PolicyPerson =
  string | { id: string; departmentPreviewId?: string };
export function previewRoleFor(person: PolicyPerson) {
  const id = typeof person === "string" ? person : person.id;
  return previewRoles.find((role) => role.id === id);
}

export function canAccessWorkspace(person: PolicyPerson, workspaceId: string) {
  const role = previewRoleFor(person);
  if (!role) return false;
  if (workspaceAccessLevels[workspaceId] === "internal") return true;
  // Whole confidential workspaces and the separate legacy governance boundary
  // retain their original genuine membership. Ordinary relevance is not access.
  return role.workspaceMemberships.includes(workspaceId);
}

/** Original participation remains useful for relevance without gating exploration. */
export const isWorkspacePinnedForRole = (
  person: PolicyPerson,
  workspaceId: string,
) => !!previewRoleFor(person)?.workspaceMemberships.includes(workspaceId);

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
  return [
    "foundations",
    "messaging",
    "insight",
    "standards",
    "learning",
    "tools",
    "contacts",
    "a-z",
  ].includes(areaId);
}
export const canAccessPortal = (person: PolicyPerson) =>
  !!previewRoleFor(person);
export const canAccessProject = (person: PolicyPerson, projectId: string) => {
  const role = previewRoleFor(person);
  return (
    !!role &&
    (projectAccessLevels[projectId] === "Open Internal" ||
      (projectAccessLevels[projectId] === "Restricted" &&
        role.projectMemberships.includes(projectId)))
  );
};
export const canAccessProjectTeam = (
  person: PolicyPerson,
  projectId: string,
) => {
  const role = previewRoleFor(person);
  return (
    !!role &&
    (projectAccessLevels[projectId] === "Open Internal" ||
      (projectAccessLevels[projectId] === "Restricted" &&
        role.projectTeamMemberships.includes(projectId)))
  );
};
export const isProjectPinnedForRole = (
  person: PolicyPerson,
  projectId: string,
) => !!previewRoleFor(person)?.projectTeamMemberships.includes(projectId);
const knownDepartments = [
  "marketing-growth",
  "communications",
  "finance-services",
  "strategy-technology",
  "people-culture",
  "executive-office",
];
/** A route-scoped preview is confined to the chosen Department, for every role. */
export const departmentPreviewFor = (person: PolicyPerson) =>
  typeof person !== "string" &&
  !!previewRoleFor(person) &&
  person.departmentPreviewId &&
  knownDepartments.includes(person.departmentPreviewId)
    ? person.departmentPreviewId
    : undefined;
export const canAccessDepartment = (
  person: PolicyPerson,
  departmentId: string,
) => {
  const preview = departmentPreviewFor(person);
  return preview
    ? preview === departmentId
    : previewRoleFor(person)?.departmentId === departmentId;
};
export function canAccessUnit(
  person: PolicyPerson,
  departmentId: string,
  unitId: string,
  unitOnly = true,
) {
  const role = previewRoleFor(person);
  return (
    !!role &&
    canAccessDepartment(person, departmentId) &&
    role.departmentId === departmentId &&
    (!unitOnly || role.unitId === unitId)
  );
}

function canonicalChannel(workspaceId: string, channelId: string) {
  if (workspaceId === "content")
    return channelDefinitions.find(
      (channel) => channel.id === channelId || channel.name === channelId,
    )?.id;
  if (workspaceId === "digital")
    return technicalChannelDefinitions.find(
      (channel) => channel.name === channelId,
    )?.name;
  if (workspaceId === "planning")
    return planningChannels.includes(channelId) ? channelId : undefined;
  return operationalChannels.find(
    (channel) =>
      channel.team === workspaceId &&
      (channel.id === channelId || channel.name === channelId),
  )?.id;
}

/** Daily sidebar membership is deliberately narrower than ordinary channel access. */
export function isChannelPinnedForRole(
  person: PolicyPerson,
  workspaceId: string,
  channelId: string,
) {
  const role = previewRoleFor(person);
  const id = canonicalChannel(workspaceId, channelId);
  return (
    !!role &&
    !!id &&
    (workspaceId === "company" ||
      !!role.teamChannels[workspaceId]?.includes(id))
  );
}

/** Genuine private-channel entitlement, including occasional unpinned membership. */
export function canAccessRestrictedChannel(
  person: PolicyPerson,
  workspaceId: string,
  channelId: string,
) {
  const role = previewRoleFor(person);
  const id = canonicalChannel(workspaceId, channelId);
  return (
    !!role &&
    !!id &&
    !!(
      role.teamChannels[workspaceId]?.includes(id) ||
      role.additionalChannelAccess?.[workspaceId]?.includes(id)
    )
  );
}

export function canAccessChannel(
  person: PolicyPerson,
  workspaceId: string,
  channelId: string,
) {
  const role = previewRoleFor(person);
  if (!role) return false;
  const id = canonicalChannel(workspaceId, channelId);
  if (!id) return false;
  if (workspaceId === "company") return true;
  if (!canAccessWorkspace(role, workspaceId)) return false;
  const restricted =
    workspaceId === "digital" &&
    technicalChannelDefinitions.some(
      (channel) => channel.name === id && channel.privacy === "private",
    );
  return !restricted || canAccessRestrictedChannel(role, workspaceId, id);
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
  | { kind: "unit"; departmentId: string; unitId: string; unitOnly?: boolean }
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
    case "unit":
      return canAccessUnit(
        person,
        resource.departmentId,
        resource.unitId,
        resource.unitOnly,
      );
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
    !resourceAccess(currentId, resource) &&
    allowedPreviewRoles(resource).some((role) => role.id !== currentId)
  );
}
