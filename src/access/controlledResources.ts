import { protectedSubjects as financeSubjects } from "../finance/data";
import { protectedTopics, protectedHref } from "../content/data";
import { channelDefinitions } from "../content/channelDefinitions";
import { planningChannels } from "../planning/channels";
import { channels as operationalChannels } from "../logistics/data";
import { functionalConfigs } from "../workspaces/config";
import {
  workspaceAccessLevels,
  workspaceSeed,
} from "../workspaces/accessClassification";
import { environmentRegistry } from "../workspaces/registry";
import { consultationArea } from "../workspaces/welfare";
import {
  navigation as executiveNavigation,
  initiatives as executiveInitiatives,
} from "../executive/data";
import { initialIncidents } from "../executive/incidentData";
import {
  projectAccessLevels,
  projectSeeds,
} from "../projects/accessClassification";
import { allProjects, projectHref } from "../projects/data";
import { technicalChannelDefinitions } from "../workspaces/technicalChannelDefinitions";
import { departments } from "../coordination/data";
import {
  canManageSiteSettings,
  hasAlternativePreviewAccess,
  previewRoles,
  resourceAccess,
  type AccessResource,
  type PolicyPerson,
} from "./policy";
import { protectedAreaDefinitions } from "./areaDefinitions";

export type ControlledResourceCategory =
  | "workspace"
  | "protected-area"
  | "executive-initiative"
  | "private-channel"
  | "project"
  | "project-team"
  | "project-security"
  | "department-context"
  | "unit"
  | "incident"
  | "site-administration"
  | "external-governance";

interface Expectation {
  /** Business expectations, deliberately independent of the current policy grants. */
  expectedRoleIds: readonly string[];
  rationale: string;
}

export interface ControlledResourceDefinition extends Expectation {
  id: string;
  category: ControlledResourceCategory;
  label: string;
  href: string;
  resource?: AccessResource;
  administrationWorkspaceId?: string;
  administrationSiteId?: string;
  securityProjectId?: string;
  /** Department General is intentionally explorable through an explicit context. */
  contextualDepartmentId?: string;
  genuinelyRestricted: boolean;
  /** Some resources are rows within an existing page, rather than separate routes. */
  contentId?: string;
  outOfScopeReason?: string;
}

const allRoleIds = [
  "taylor",
  "maya",
  "robin",
  "jamie",
  "devon",
  "leonie",
  "nadia",
  "sam",
  "elliot",
] as const;
const expectation = (
  expectedRoleIds: readonly string[],
  rationale: string,
): Expectation => ({
  expectedRoleIds,
  rationale,
});
const outside = (rationale: string) => expectation([], rationale);
const grouped = (ids: string[], value: Expectation) =>
  Object.fromEntries(ids.map((id) => [id, value]));

/**
 * This is a reviewable business matrix, not a copy generated from role grants.
 * A new canonical subject must receive an explicit expectation here; it cannot
 * silently inherit an arbitrary specialist or an outside-scope exemption.
 */
const protectedExpectations: Record<string, Record<string, Expectation>> = {
  services: grouped(
    ["live-tender", "negotiation", "visitor-arrangements"],
    outside(
      "The procurement or sensitive-visit participants are not selectable preview identities.",
    ),
  ),
  digital: {
    ...grouped(
      [
        "security",
        "production",
        "recovery",
        "vulnerabilities",
        "restricted-web",
      ],
      expectation(
        ["devon"],
        "The technology administrator operates and recovers technical platforms.",
      ),
    ),
    ...grouped(
      ["privileged-access", "credentials"],
      outside(
        "Privileged account records and secrets require a separate authorisation not represented by a preview role.",
      ),
    ),
  },
  legal: grouped(
    [
      "privileged",
      "disputes",
      "privacy-incidents",
      "investigations",
      "formal-cases",
      "sensitive-risk",
    ],
    outside(
      "Privileged legal and individual case participants are not selectable preview identities.",
    ),
  ),
  people: {
    "network-membership": outside(
      "Private staff-network membership requires the relevant network participant; personnel administration is not that entitlement.",
    ),
  },
  employment: {
    ...grouped(
      [
        "candidate-applications",
        "candidate-assessments",
        "references",
        "offers",
        "employee-records",
        "employment-changes",
        "employee-master-data",
        "absence-administration",
      ],
      expectation(
        ["jamie"],
        "The personnel administrator handles recruitment and authorised employment administration.",
      ),
    ),
    ...grouped(
      ["payroll-inputs", "placement", "compensation"],
      outside(
        "Individual payroll, compensation and health/placement work require separately authorised specialists outside the preview identities.",
      ),
    ),
  },
  customer: {
    "commercial-account": expectation(
      ["nadia"],
      "The internal marketing specialist supports a controlled commercial-account negotiation example.",
    ),
    ...grouped(
      ["platinum", "customer-cases"],
      outside(
        "Private customer cases and premium account stewardship require the specifically assigned case/account participants.",
      ),
    ),
  },
  archives: {
    historical: outside(
      "Restricted historical collections require a separately authorised archive researcher or records custodian.",
    ),
  },
  welfare: {
    ...grouped(
      ["welfare-support", "approved-consultation"],
      expectation(
        ["jamie"],
        "The personnel administrator coordinates support pathways and approved non-identifiable outputs only.",
      ),
    ),
    ...grouped(
      ["safeguarding-complaints", "employee-representation"],
      outside(
        "Safeguarding and independent representation remain with their independent authorised participants, not personnel administration.",
      ),
    ),
  },
  finance: {
    ...grouped(
      [
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
      expectation(
        ["sam"],
        "Finance operations reviews selected operational exceptions, aggregate planning, accounting and liquidity work.",
      ),
    ),
    ...grouped(
      ["restructuring-cost", "pre-decision"],
      expectation(
        ["robin"],
        "These financial scenarios are reserved for executive pre-decision review.",
      ),
    ),
    ...grouped(
      [
        "payroll-settlement",
        "employee-reimbursements",
        "exceptional-authorisation",
        "tax-working-papers",
        "accounting-investigation",
        "sensitive-adjustment",
        "bank-mandates",
        "signatories",
        "transfer-authorisation",
        "banking-security",
      ],
      outside(
        "Individual-sensitive finance records, tax/investigation work and high-risk banking/authorisation functions require separately appointed participants outside the preview identities.",
      ),
    ),
  },
  content: {
    "commercial-proposal": expectation(
      ["nadia"],
      "The internal marketing specialist can review the controlled commercial proposal.",
    ),
    ...grouped(
      [
        "participant-administration",
        "pre-release-briefing",
        "embargoed-distribution",
      ],
      outside(
        "Participant details and pre-release/embargo handling require the specifically authorised production or participant-administration group.",
      ),
    ),
  },
  audience: {
    "participant-administration": outside(
      "Raw or identifiable research participant administration is reserved for the authorised research-administration group.",
    ),
  },
  planning: {
    restricted: expectation(
      ["robin"],
      "The executive director can review restricted organisation planning.",
    ),
  },
  projects: grouped(
    ["control", "reviews"],
    expectation(
      ["robin"],
      "The executive director performs project governance and portfolio review.",
    ),
  ),
  executive: grouped(
    [
      "home",
      ...executiveNavigation.map((area) => area.id),
      ...executiveInitiatives.map((initiative) => initiative.id),
    ],
    expectation(
      ["robin"],
      "The executive director coordinates executive work and reviews the complete strategic-initiative portfolio.",
    ),
  ),
};

const definition = (
  value: Omit<
    ControlledResourceDefinition,
    keyof Expectation | "outOfScopeReason"
  >,
  expected: Expectation | undefined,
): ControlledResourceDefinition => ({
  ...value,
  ...(expected || expectation([], "MISSING BUSINESS EXPECTATION")),
  ...(expected?.expectedRoleIds.length === 0
    ? { outOfScopeReason: expected.rationale }
    : {}),
});

function areaDefinition(
  workspaceId: string,
  areaId: string,
  label: string,
  href: string,
  contentId?: string,
) {
  return definition(
    {
      id: `area:${workspaceId}:${areaId}`,
      category: contentId ? "executive-initiative" : "protected-area",
      label,
      href,
      resource: { kind: "area", workspaceId, areaId },
      genuinelyRestricted: true,
      ...(contentId ? { contentId } : {}),
    },
    protectedExpectations[workspaceId]?.[areaId],
  );
}

const workspaceHref = (id: string) =>
  workspaceSeed.find((workspace) => workspace[0] === id)?.[2] || "";
const confidentialWorkspaceRoles: Record<string, readonly string[]> = {
  executive: ["robin"],
  employment: ["jamie"],
  welfare: ["jamie"],
};
const restrictedProjectRoles: Record<string, readonly string[]> = {
  "PRJ-2026-027": ["robin"],
  "PRJ-2026-038": ["robin", "sam"],
  "PRJ-2026-045": [],
};
const restrictedProjectTeamRoles: Record<string, readonly string[]> = {
  "PRJ-2026-027": ["robin"],
  "PRJ-2026-038": ["sam"],
  "PRJ-2026-045": [],
};
const projectSecurityExpectations: Record<string, Expectation> = {
  ...grouped(
    ["PRJ-2026-014", "PRJ-2026-042", "PRJ-2020-006"],
    expectation(
      ["devon"],
      "The assigned technical project participant reviews release/security acceptance and recovery readiness; this does not disclose credentials or privileged account records.",
    ),
  ),
  ...grouped(
    [
      "PRJ-2026-021",
      "PRJ-2026-027",
      "PRJ-2026-031",
      "PRJ-2026-034",
      "PRJ-2026-038",
      "PRJ-2026-045",
      "PRJ-2024-018",
      "PRJ-2024-026",
      "PRJ-2025-007",
      "PRJ-2022-011",
      "PRJ-2023-019",
      "PRJ-2023-027",
      "PRJ-2021-014",
      "PRJ-2021-022",
      "PRJ-2018-009",
    ],
    outside(
      "No selectable preview identity is the assigned technical security-acceptance reviewer for this project. General project governance, finance participation and site administration do not confer that project-specific assurance responsibility.",
    ),
  ),
};
const departmentRoles: Record<string, readonly string[]> = {
  "marketing-growth": ["taylor", "maya", "nadia"],
  communications: [],
  "finance-services": ["sam"],
  "strategy-technology": ["devon", "leonie", "elliot"],
  "people-culture": ["jamie"],
  "executive-office": ["robin"],
};
const unitRoles: Record<string, readonly string[]> = {
  "marketing-insight-and-performance": ["taylor", "nadia"],
  "acquisition-and-direct-engagement": ["maya"],
  "accounting-and-control": ["sam"],
  "it-services": ["devon", "leonie", "elliot"],
  "people-operations": ["jamie"],
  "ceo-office": ["robin"],
};
/** Reviewed exclusions, not a fallback for newly added units. */
const unrepresentedUnitIds = new Set([
  "marketing-growth:strategic-accounts",
  "marketing-growth:income-administration",
  "communications:editorial-and-content",
  "communications:media-relations",
  "communications:public-affairs",
  "communications:brand-and-creative",
  "communications:digital-channels",
  "finance-services:treasury-and-payments",
  "finance-services:legal-and-assurance",
  "people-culture:reward-and-employment",
  "people-culture:people-systems-and-analytics",
]);

/** New department/unit definitions must be reviewed rather than silently exempted. */
export function unitBusinessExpectation(
  departmentId: string,
  unitId: string,
  unitOnly: boolean,
): Expectation | undefined {
  const expected = unitOnly ? unitRoles[unitId] : departmentRoles[departmentId];
  if (expected?.length)
    return expectation(
      expected,
      "Department administration is available to that department; unit-only material additionally requires the actual unit assignment.",
    );
  if (unrepresentedUnitIds.has(`${departmentId}:${unitId}`))
    return outside(
      "No selectable preview identity belongs to the required department/unit; a contextual General preview never grants that private unit membership.",
    );
  return undefined;
}
const incidentRoles: Record<string, readonly string[]> = {
  "INC-104": ["robin", "devon"],
  "INC-107": ["jamie"],
  "INC-099": ["robin"],
};

/** Canonical fixtures define what exists; the independent matrix defines who should open it. */
export const controlledResourceInventory: ControlledResourceDefinition[] = [
  ...workspaceSeed
    .filter(([id]) => workspaceAccessLevels[id] === "strictly-confidential")
    .map(([id, label, href]) =>
      definition(
        {
          id: `workspace:${id}`,
          category: "workspace",
          label,
          href,
          resource: { kind: "workspace", workspaceId: id },
          genuinelyRestricted: true,
        },
        confidentialWorkspaceRoles[id]
          ? expectation(
              confidentialWorkspaceRoles[id],
              "Only the explicitly assigned business role enters this confidential workspace.",
            )
          : undefined,
      ),
    ),
  ...environmentRegistry
    .filter((environment) => environment.environmentType === "wiki")
    .map((environment) =>
      definition(
        {
          id: `administration:${environment.id}`,
          category: "site-administration",
          label: `${environment.title} administration`,
          href: `${environment.href}?siteSettings=permissions`,
          administrationWorkspaceId: "audience",
          administrationSiteId: environment.id,
          genuinelyRestricted: true,
        },
        expectation(
          ["leonie", "elliot"],
          "Delegated information/site administration includes the shared knowledge environment; it grants no protected research or business records.",
        ),
      ),
    ),
  ...functionalConfigs.flatMap((config) =>
    config.protected.map((subject) =>
      areaDefinition(
        config.id,
        subject.id,
        subject.name,
        config.id === "welfare"
          ? `${workspaceHref(config.id)}/${subject.id}`
          : `${workspaceHref(config.id)}/protected/${subject.id}`,
      ),
    ),
  ),
  areaDefinition(
    "welfare",
    consultationArea.id,
    consultationArea.name,
    `${workspaceHref("welfare")}/${consultationArea.id}`,
  ),
  ...Object.entries(financeSubjects).flatMap(([area, subjects]) =>
    subjects.map(([id, label]) =>
      areaDefinition(
        "finance",
        id,
        label,
        `${workspaceHref("finance")}/${area}/${id}`,
      ),
    ),
  ),
  ...protectedTopics.map((topic) =>
    areaDefinition("content", topic.id, topic.name, protectedHref(topic)),
  ),
  areaDefinition(
    "audience",
    "participant-administration",
    "Research participant administration",
    "/audience-innovation/research/website-usability/participant-administration",
  ),
  areaDefinition(
    "planning",
    "restricted",
    "Restricted Planning",
    "/planning/restricted",
  ),
  ...["control", "reviews"].map((id) =>
    areaDefinition("projects", id, `Project ${id}`, `/projects/${id}`),
  ),
  areaDefinition("executive", "home", "Executive Home", "/executive"),
  ...executiveNavigation.map((area) =>
    areaDefinition("executive", area.id, area.name, `/executive/${area.id}`),
  ),
  ...executiveInitiatives.map((initiative) =>
    areaDefinition(
      "executive",
      initiative.id,
      initiative.name,
      "/executive/initiatives",
      initiative.id,
    ),
  ),
  ...technicalChannelDefinitions
    .filter((channel) => channel.privacy === "private")
    .map((channel) =>
      definition(
        {
          id: `channel:digital:${channel.name}`,
          category: "private-channel",
          label: channel.name,
          href: `/teams?workspace=digital&channel=${encodeURIComponent(channel.name)}&context=workspace:digital`,
          resource: {
            kind: "channel",
            workspaceId: "digital",
            channelId: channel.name,
          },
          genuinelyRestricted: true,
        },
        channel.name === "Security Engineering"
          ? expectation(
              ["devon"],
              "The technology administrator is the assigned private security-engineering participant.",
            )
          : undefined,
      ),
    ),
  ...projectSeeds
    .filter((seed) => seed[8] === "Restricted")
    .flatMap((seed) => {
      const id = `PRJ-2026-${seed[0]}`;
      const reason =
        id === "PRJ-2026-045"
          ? "The controlled supplier project requires a procurement project participant not represented among the preview identities."
          : "Project and channel participation follow their separately assigned delivery/governance roles.";
      return [
        definition(
          {
            id: `project:${id}`,
            category: "project",
            label: seed[1],
            href: `/projects/${id}`,
            resource: { kind: "project", projectId: id },
            genuinelyRestricted: true,
          },
          restrictedProjectRoles[id]
            ? expectation(restrictedProjectRoles[id], reason)
            : undefined,
        ),
        definition(
          {
            id: `project-team:${id}`,
            category: "project-team",
            label: `${seed[1]} channels`,
            href: `${projectHref(allProjects.find((project) => project.code === id)!)}/teams?channel=General&context=project:${id}`,
            resource: { kind: "project-team", projectId: id },
            genuinelyRestricted: true,
          },
          restrictedProjectTeamRoles[id]
            ? expectation(restrictedProjectTeamRoles[id], reason)
            : undefined,
        ),
      ];
    }),
  ...allProjects.map((project) =>
    definition(
      {
        id: `project-security:${project.code}`,
        category: "project-security",
        label: `${project.name} production security review`,
        href: `${projectHref(project)}/security`,
        securityProjectId: project.code,
        resource: { kind: "project-security", projectId: project.code },
        genuinelyRestricted: true,
      },
      projectSecurityExpectations[project.code],
    ),
  ),
  ...departments.flatMap((department) => [
    definition(
      {
        id: `department:${department.id}`,
        category: "department-context",
        label: department.name,
        href: `/teams?department=${department.id}&context=department:${department.id}`,
        resource: { kind: "department", departmentId: department.id },
        contextualDepartmentId: department.id,
        genuinelyRestricted: false,
      },
      expectation(
        allRoleIds,
        "An explicit department entry previews its ordinary General channel for every valid role; this is not unit membership.",
      ),
    ),
    ...department.units.map((unit) => {
      const reviewedExpectation = unitBusinessExpectation(
        department.id,
        unit.id,
        unit.access === "Unit-only",
      );
      return definition(
        {
          id: `unit:${department.id}:${unit.id}`,
          category: "unit",
          label: `${department.name} / ${unit.name}`,
          href: `/teams?department=${department.id}&unit=${unit.id}&context=department:${department.id}&tab=Shared&folder=Unit+Coordination`,
          resource: {
            kind: "unit",
            departmentId: department.id,
            unitId: unit.id,
            unitOnly: unit.access === "Unit-only",
          },
          genuinelyRestricted: true,
        },
        reviewedExpectation,
      );
    }),
  ]),
  ...initialIncidents.map((incident) =>
    definition(
      {
        id: `emergency:${incident.id}`,
        category: "incident",
        label: incident.title,
        href: `/emergency-response/incidents/${incident.id}?context=incident:${incident.id}`,
        resource: { kind: "emergency", incidentId: incident.id },
        genuinelyRestricted: true,
      },
      incidentRoles[incident.id]
        ? expectation(
            incidentRoles[incident.id],
            "Only the assigned incident-response participants can open this incident.",
          )
        : undefined,
    ),
  ),
  ...workspaceSeed
    .filter(([id]) => workspaceAccessLevels[id] === "internal")
    .map(([id, label, href]) =>
      definition(
        {
          id: `administration:${id}`,
          category: "site-administration",
          label: `${label} administration`,
          href: `${href}?siteSettings=permissions`,
          administrationWorkspaceId: id,
          genuinelyRestricted: true,
        },
        expectation(
          ["leonie", "elliot"],
          "Delegated information/site administration changes structure and settings without conferring protected business-content access.",
        ),
      ),
    ),
  definition(
    {
      id: "external:governance",
      category: "external-governance",
      label: "Membership Portal",
      href: "/governance",
      genuinelyRestricted: false,
    },
    outside(
      "Governance URLs now resolve to an external-environment proof-of-concept boundary. Committee records are outside this internal preview and have no fabricated role entitlement.",
    ),
  ),
];

export function controlledResourceAccess(
  person: PolicyPerson,
  entry: ControlledResourceDefinition,
) {
  if (entry.administrationWorkspaceId)
    return canManageSiteSettings(person, entry.administrationWorkspaceId);
  if (!entry.resource) return false;
  const id = typeof person === "string" ? person : person.id;
  return resourceAccess(
    entry.contextualDepartmentId
      ? { id, departmentPreviewId: entry.contextualDepartmentId }
      : person,
    entry.resource,
  );
}

export interface IntegrityOptions {
  inventory?: ControlledResourceDefinition[];
  policyAreas?: Record<string, string[]>;
  roles?: typeof previewRoles;
  access?: typeof controlledResourceAccess;
}

/** Returns actionable failures rather than concealing intentionally unrepresented functions. */
export function accessMatrixIntegrityIssues({
  inventory = controlledResourceInventory,
  policyAreas = protectedAreaDefinitions,
  roles = previewRoles,
  access = controlledResourceAccess,
}: IntegrityOptions = {}) {
  const issues: string[] = [];
  const ids = new Set<string>();
  const areaIds = new Set(
    inventory.flatMap((entry) =>
      entry.resource?.kind === "area"
        ? [`${entry.resource.workspaceId}:${entry.resource.areaId}`]
        : [],
    ),
  );
  const canonicalChannelIds: Record<string, string[]> = {
    content: channelDefinitions.map((channel) => channel.id),
    digital: technicalChannelDefinitions.map((channel) => channel.name),
    planning: planningChannels,
    ...Object.fromEntries(
      [...new Set(operationalChannels.map((channel) => channel.team))].map(
        (workspaceId) => [
          workspaceId,
          operationalChannels
            .filter((channel) => channel.team === workspaceId)
            .map((channel) => channel.id),
        ],
      ),
    ),
  };
  for (const [workspaceId, subjects] of Object.entries(policyAreas)) {
    for (const areaId of subjects)
      if (!areaIds.has(`${workspaceId}:${areaId}`))
        issues.push(
          `Policy area has no canonical resource: ${workspaceId}:${areaId}`,
        );
  }
  for (const role of roles) {
    for (const workspaceId of role.workspaceMemberships)
      if (!workspaceAccessLevels[workspaceId])
        issues.push(`Unknown workspace membership: ${role.id} ${workspaceId}`);
    const department = departments.find(
      (candidate) => candidate.id === role.departmentId,
    );
    if (!department)
      issues.push(
        `Unknown department assignment: ${role.id} ${role.departmentId}`,
      );
    else if (!department.units.some((unit) => unit.id === role.unitId))
      issues.push(`Unknown unit assignment: ${role.id} ${role.unitId}`);
    for (const channelAssignments of [
      role.teamChannels,
      role.additionalChannelAccess || {},
    ])
      for (const [workspaceId, channelIds] of Object.entries(
        channelAssignments,
      ))
        for (const channelId of channelIds)
          if (!canonicalChannelIds[workspaceId]?.includes(channelId))
            issues.push(
              `Unknown channel grant: ${role.id} ${workspaceId}:${channelId}`,
            );
    for (const [workspaceId, subjects] of Object.entries(
      role.restrictedAreas,
    )) {
      for (const areaId of subjects)
        if (!policyAreas[workspaceId]?.includes(areaId))
          issues.push(
            `Unknown policy grant: ${role.id} ${workspaceId}:${areaId}`,
          );
    }
    for (const projectId of [
      ...role.projectMemberships,
      ...role.projectTeamMemberships,
    ])
      if (!projectAccessLevels[projectId])
        issues.push(`Unknown project grant: ${role.id} ${projectId}`);
    for (const incidentId of role.emergencyMemberships)
      if (!initialIncidents.some((incident) => incident.id === incidentId))
        issues.push(`Unknown incident grant: ${role.id} ${incidentId}`);
  }
  for (const entry of inventory) {
    if (ids.has(entry.id))
      issues.push(`Duplicate controlled resource: ${entry.id}`);
    ids.add(entry.id);
    if (entry.rationale === "MISSING BUSINESS EXPECTATION")
      issues.push(`Missing business expectation: ${entry.id}`);
    if (!entry.href.startsWith("/") || entry.href.startsWith("//"))
      issues.push(`Invalid local destination: ${entry.id}`);
    if (
      entry.resource?.kind === "area" &&
      !policyAreas[entry.resource.workspaceId]?.includes(entry.resource.areaId)
    )
      issues.push(`Canonical resource has no policy area: ${entry.id}`);
    for (const expectedId of entry.expectedRoleIds)
      if (!roles.some((role) => role.id === expectedId))
        issues.push(`Unknown expected preview role: ${entry.id} ${expectedId}`);
    const allowed = roles.filter((role) => access(role, entry));
    if (!allowed.length && !entry.outOfScopeReason)
      issues.push(`Orphaned controlled resource: ${entry.id}`);
    if (entry.outOfScopeReason && allowed.length)
      issues.push(`Outside-scope resource unexpectedly granted: ${entry.id}`);
    if (entry.genuinelyRestricted && allowed.length === roles.length)
      issues.push(`Over-broad restricted resource: ${entry.id}`);
    for (const role of roles) {
      const expected = entry.expectedRoleIds.includes(role.id);
      if (access(role, entry) !== expected)
        issues.push(
          `${expected ? "Expected specialist denied" : "Unexpected protected access"}: ${entry.id} ${role.id}`,
        );
      if (entry.resource && !entry.contextualDepartmentId) {
        const alternative = hasAlternativePreviewAccess(
          entry.resource,
          role.id,
        );
        if (alternative !== (!access(role, entry) && allowed.length > 0))
          issues.push(
            `Role-switch alternative mismatch: ${entry.id} ${role.id}`,
          );
      }
    }
  }
  return issues;
}
