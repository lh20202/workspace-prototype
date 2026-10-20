import {
  protectedAreaDefinitions,
  ordinaryAreaDefinitions,
} from "./areaDefinitions";
export {
  protectedAreaDefinitions,
  ordinaryAreaDefinitions,
} from "./areaDefinitions";
import { workspaceAccessLevels } from "../workspaces/accessClassification";
import { projectAccessLevels } from "../projects/accessClassification";
import { channelDefinitions } from "../content/channelDefinitions";
import { technicalChannelDefinitions } from "../workspaces/technicalChannelDefinitions";
import { channels as operationalChannels } from "../logistics/data";
import { planningChannels } from "../planning/channels";
import {
  departmentDefinitions,
  unitId as canonicalUnitId,
  unitOnly as privateUnitNames,
} from "../coordination/definitions";
import { isDemoContentRevealed } from "./demoContentReveal";

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
    role: "Demo User",
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
    workspaceMemberships: [...ordinaryWorkspaces, "executive", "content"],
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
        "SI-03",
        "SI-04",
        "SI-05",
      ],
      planning: ["restricted"],
      projects: ["control", "reviews"],
      finance: ["restructuring-cost", "pre-decision"],
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
      // Platform delivery and recovery do not confer access to secrets or privileged records.
      digital: [
        "security",
        "production",
        "recovery",
        "vulnerabilities",
        "restricted-web",
      ],
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
    restrictedAreas: {
      // Selected commercial work; customer cases, participant data and embargoes remain separate.
      content: ["commercial-proposal"],
      customer: ["commercial-account"],
    },
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
    restrictedAreas: {
      finance: [
        "income",
        "reconciliation",
        "planning",
        "treasury",
        "payment-exceptions",
        "refund-chargeback",
        "high-value-payment",
        "payment-data-correction",
        "disputed-supplier-payment",
        "draft-scenarios",
        "workforce-cost",
        "investment-affordability",
        "external-audit",
        "pre-issue-statements",
        "liquidity-stress",
      ],
    },
    teamChannels: { planning: ["Planning & Reporting"] },
    teamsLanding: { kind: "department", departmentId: "finance-services" },
    projectMemberships: ["PRJ-2026-038"],
    projectTeamMemberships: ["PRJ-2026-038"],
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
  if (isDemoContentRevealed({ kind: "workspace", workspaceId }, person))
    return true;
  const role = previewRoleFor(person);
  if (!role) return false;
  if (workspaceAccessLevels[workspaceId] === "internal") return true;
  // Whole confidential workspaces retain genuine membership. Unknown/retired
  // destinations cannot become access grants through stale fixture membership.
  return (
    workspaceAccessLevels[workspaceId] === "strictly-confidential" &&
    role.workspaceMemberships.includes(workspaceId)
  );
}

/** Original participation remains useful for relevance without gating exploration. */
export const isWorkspacePinnedForRole = (
  person: PolicyPerson,
  workspaceId: string,
) => !!previewRoleFor(person)?.workspaceMemberships.includes(workspaceId);

export function canAccessArea(
  person: PolicyPerson,
  workspaceId: string,
  areaId: string,
) {
  if (
    areaId === "home" &&
    isDemoContentRevealed({ kind: "workspace", workspaceId }, person)
  )
    return true;
  if (isDemoContentRevealed({ kind: "area", workspaceId, areaId }, person))
    return true;
  const role = previewRoleFor(person);
  if (!role || !canAccessWorkspace(role, workspaceId)) return false;
  if (protectedAreaDefinitions[workspaceId]?.includes(areaId))
    return !!role.restrictedAreas[workspaceId]?.includes(areaId);
  return !!ordinaryAreaDefinitions[workspaceId]?.includes(areaId);
}

export function canAccessWikiArea(person: PolicyPerson, areaId: string) {
  if (isDemoContentRevealed({ kind: "wiki", areaId }, person)) return true;
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
  isDemoContentRevealed({ kind: "portal" }, person) || !!previewRoleFor(person);
export const canAccessProject = (person: PolicyPerson, projectId: string) => {
  if (isDemoContentRevealed({ kind: "project", projectId }, person))
    return true;
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
  if (isDemoContentRevealed({ kind: "project-team", projectId }, person))
    return true;
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

/** Assigned technical reviewers can inspect delivery security without receiving secrets. */
export function canAccessProjectSecurityReview(
  person: PolicyPerson,
  projectId: string,
) {
  if (isDemoContentRevealed({ kind: "project-security", projectId }, person))
    return true;
  const role = previewRoleFor(person);
  return (
    !!role &&
    !!projectAccessLevels[projectId] &&
    role.projectMemberships.includes(projectId) &&
    canAccessArea(role, "digital", "production") &&
    canAccessArea(role, "digital", "security")
  );
}
const knownDepartments = departmentDefinitions.map(([id]) => id);
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
  if (isDemoContentRevealed({ kind: "department", departmentId }, person))
    return true;
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
  if (
    isDemoContentRevealed(
      { kind: "unit", departmentId, unitId, unitOnly },
      person,
    )
  )
    return true;
  const role = previewRoleFor(person);
  const unitName = departmentDefinitions
    .find(([id]) => id === departmentId)?.[6]
    .find((name) => canonicalUnitId(name) === unitId);
  const privateUnit = !!unitName && privateUnitNames.has(unitName);
  return (
    !!role &&
    !!unitName &&
    canAccessDepartment(person, departmentId) &&
    role.departmentId === departmentId &&
    (!(unitOnly || privateUnit) || role.unitId === unitId)
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
  if (
    isDemoContentRevealed({ kind: "channel", workspaceId, channelId }, person)
  )
    return true;
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
  isDemoContentRevealed({ kind: "emergency", incidentId }, person) ||
  !!previewRoleFor(person)?.emergencyMemberships.includes(incidentId);

export type AccessResource =
  | { kind: "workspace"; workspaceId: string }
  | { kind: "area"; workspaceId: string; areaId: string }
  | { kind: "wiki"; areaId: string }
  | { kind: "portal" }
  | { kind: "project"; projectId: string }
  | { kind: "project-team"; projectId: string }
  | { kind: "project-security"; projectId: string }
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
    case "project-security":
      return canAccessProjectSecurityReview(person, resource.projectId);
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
