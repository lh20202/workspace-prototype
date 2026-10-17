import { externalEnvironmentById } from "../environments/catalog";
import {
  employmentProtectedSubjects,
  legacyEmploymentBoundary,
} from "./employmentSubjects";
import { legacyWelfareDestination } from "./welfare";

export type HubId = "sales-marketing" | "infrastructure" | "personnel";
export type EnvironmentType = "workspace" | "portal" | "wiki";
export type WorkspaceAccessLevel = "internal" | "strictly-confidential";

export interface HubDefinition {
  id: HubId;
  name: string;
  icon: string;
  description: string;
  workspaceIds: string[];
  /** References to registered environments, surfaced only once implemented. */
  wiki?: string;
  portal?: string;
  externalIds?: string[];
}

export const hubDefinitions: HubDefinition[] = [
  {
    id: "sales-marketing",
    name: "Marketing & Sales",
    icon: "organisation",
    description: "",
    workspaceIds: ["audience", "content", "logistics", "customer"],
    wiki: "sales-wiki",
    portal: "frontline-sales",
    externalIds: ["media-library"],
  },
  {
    id: "infrastructure",
    name: "Org Central",
    externalIds: ["members", "city-health"],
    icon: "infrastructure",
    description: "",
    workspaceIds: [
      "executive",
      "planning",
      "projects",
      "quality",
      "legal",
      "services",
      "digital",
      "archives",
    ],
  },
  {
    id: "personnel",
    name: "Personnel",
    externalIds: ["taskforce"],
    icon: "personnel",
    description: "",
    workspaceIds: ["people", "employment", "welfare"],
  },
];
export const hubById = new Map(hubDefinitions.map((hub) => [hub.id, hub]));
export const architectureSections: (
  { type: "hub"; id: HubId } | { type: "workspace"; id: string }
)[] = [
  { type: "hub", id: "sales-marketing" },
  { type: "hub", id: "infrastructure" },
  { type: "hub", id: "personnel" },
  { type: "workspace", id: "finance" },
];
const hubLabels: Record<string, string> = {
  audience: "Research & Insight",
  content: "Creative Studio",
  logistics: "Acquisition Logistics",
  customer: "Customer Relations",
  executive: "Executive & CEO",
  planning: "Planning Cycle",
  projects: "Project Centre",
  quality: "Quality & Monitoring",
  legal: "Legal & Risk",
  services: "Purchasing & Office",
  digital: "Tech & Digital",
  archives: "Company Archives",
  employment: "Employment & Hiring",
};
export const strictlyConfidentialWorkspaceIds = [
  "executive",
  "employment",
  "welfare",
];

export interface WorkspaceDefinition {
  id: string;
  title: string;
  href: string;
  description: string;
  purpose: string;
  group: string;
  icon: string;
  teams: boolean;
  accessModel: string;
  departmentRelationships: string[];
  hubId?: HubId;
  hubLabel: string;
  accessLevel: WorkspaceAccessLevel;
  environmentType: EnvironmentType;
}
const seed: [string, string, string, string, string, string, boolean][] = [
  [
    "projects",
    "Project Centre",
    "/projects",
    "Coordinate project governance and support, and access current and completed project workspaces.",
    "Project delivery",
    "projects",
    false,
  ],
  [
    "planning",
    "Planning Cycle",
    "/planning",
    "Organisation-wide strategy, planning and formal performance reporting.",
    "Strategy & planning",
    "strategy",
    true,
  ],
  [
    "logistics",
    "Acquisition Logistics",
    "/logistics",
    "Operational deployment, rotas, locations, staffing coordination and direct-delivery logistics.",
    "Campaign operations",
    "people",
    true,
  ],
  [
    "audience",
    "Research & Insight",
    "/audience-innovation",
    "Audience research, segmentation, journeys, behavioural insight, analysis, experimentation and marketing-automation ideation.",
    "Audience & experience",
    "research",
    false,
  ],
  [
    "content",
    "Creative Studio",
    "/content-delivery",
    "Shared production space where channel teams and topic specialists plan, create, review and release public-facing work.",
    "Audience & experience",
    "content",
    true,
  ],
  [
    "customer",
    "Customer Relations",
    "/customer-relations",
    "Customer care, relationship continuity, account stewardship, partnerships and frontline interaction quality.",
    "Customer relationships",
    "customer",
    false,
  ],
  [
    "finance",
    "Income & Financial Operations",
    "/financial-operations",
    "Income administration, reconciliation, payments, accounting, financial planning and treasury.",
    "Financial operations",
    "finance",
    false,
  ],
  [
    "services",
    "Purchasing & Office",
    "/services",
    "Office maintenance and equipment, purchasing and suppliers, travel services and reception.",
    "Workplace operations",
    "services",
    false,
  ],
  [
    "quality",
    "Quality & Monitoring",
    "/quality-monitoring",
    "Shared workspace for monitoring quality, improving processes, coordinating process improvement work and developing more effective and environmentally responsible ways of working.",
    "Improvement",
    "quality",
    false,
  ],
  [
    "digital",
    "Tech & Digital",
    "/digital-tech",
    "Shared engineering and technology workspace for building, operating and governing digital platforms, business systems, automation and emerging technology.",
    "Engineering & platforms",
    "digital",
    true,
  ],
  [
    "legal",
    "Legal & Risk",
    "/legal-compliance",
    "Shared workspace for legal review, privacy, compliance, organisational risk and assurance activity.",
    "Advice & assurance",
    "legal",
    false,
  ],
  [
    "people",
    "People & Culture",
    "/people-culture",
    "Workforce and organisation development, leadership, culture, inclusion, capability, staff communications and wellbeing programmes.",
    "People & organisation",
    "people-culture",
    false,
  ],
  [
    "employment",
    "Employment & Hiring Administration",
    "/employment-admin",
    "Shared controlled workspace for recruitment administration, employment records, contracts and authorised employment changes.",
    "Employment operations",
    "employment",
    false,
  ],
  [
    "welfare",
    "Welfare & Employee Representation",
    "/welfare-representation",
    "Strictly confidential coordination for staff welfare, safeguarding and independent employee representation.",
    "Personnel",
    "welfare",
    false,
  ],
  [
    "executive",
    "Executive & CEO",
    "/executive",
    "Executive coordination, restricted leadership work, governance liaison and strategic initiatives.",
    "Leadership & governance",
    "executive",
    false,
  ],
  [
    "archives",
    "Company Archives",
    "/archives",
    "Search, preserve and manage the company's historical records and organisational memory.",
    "Records & memory",
    "archives",
    false,
  ],
];
export const workspaceRegistry: WorkspaceDefinition[] = seed.map(
  ([id, title, href, description, group, icon, teams]) => ({
    id,
    title,
    href,
    description,
    purpose: description,
    group,
    icon,
    teams,
    hubId: hubDefinitions.find((hub) => hub.workspaceIds.includes(id))?.id,
    hubLabel: hubLabels[id] || title,
    accessLevel: strictlyConfidentialWorkspaceIds.includes(id)
      ? "strictly-confidential"
      : "internal",
    environmentType: "workspace",
    accessModel: strictlyConfidentialWorkspaceIds.includes(id)
      ? "Strictly confidential; protected areas require separate participation"
      : "Shared functional work; sensitive subjects require specific participation",
    departmentRelationships: [],
  }),
);
// Teams is deliberate: live operations, production and engineering; Planning keeps its lightweight reference connection.
// Other functional coordination uses company/department Teams rather than duplicate generic feeds.
export const workspaceById = new Map(workspaceRegistry.map((w) => [w.id, w]));
/** Knowledge and execution environments are related to sites, not additional SharePoint workspaces. */
export const environmentRegistry: WorkspaceDefinition[] = [
  ...workspaceRegistry,
  {
    id: "sales-wiki",
    title: "Sales & Marketing Wiki",
    href: "/sales-marketing/wiki",
    description:
      "Stable sales and marketing knowledge, reference material and practical guidance.",
    purpose: "Function-wide knowledge and guidance",
    group: "Sales & Marketing",
    icon: "wiki",
    teams: false,
    accessModel:
      "Internal knowledge; protected source systems retain their own access controls",
    departmentRelationships: [],
    hubId: "sales-marketing",
    hubLabel: "Sales & Marketing Wiki",
    accessLevel: "internal",
    environmentType: "wiki",
  },
  ...[
    [
      "frontline-sales",
      "Frontline Crew Portal",
      "/frontline-sales",
      "sales-marketing",
      "Day-to-day frontline information and tools",
    ],
    [
      "media-library",
      "Global Media Library",
      "/external/media-library",
      "sales-marketing",
      "Global media and approved visual resources",
    ],
    [
      "members",
      "Executive Committee Members portal",
      "/governance",
      "infrastructure",
      "Formal member and governance environment",
    ],
    [
      "city-health",
      "City Health Unit",
      "/external/city-health",
      "infrastructure",
      "City health information and services",
    ],
    [
      "taskforce",
      "International Taskforce Portal",
      "/external/taskforce",
      "personnel",
      "International taskforce information and coordination",
    ],
  ].map(([id, , href, hubId, purpose]): WorkspaceDefinition => ({
    id,
    title: externalEnvironmentById.get(
      id === "frontline-sales" ? "frontline" : id,
    )!.name,
    href,
    hubId: hubId as HubId,
    purpose,
    description: purpose,
    group: "External environments",
    icon: "portal",
    teams: false,
    accessModel: "Linked environment; access is managed separately",
    departmentRelationships: [],
    hubLabel: externalEnvironmentById.get(
      id === "frontline-sales" ? "frontline" : id,
    )!.name,
    accessLevel: "internal",
    environmentType: "portal",
  })),
];
export const environmentById = new Map(
  environmentRegistry.map((environment) => [environment.id, environment]),
);
/** Hub association groups sites; each site retains its own access boundary. */
export function environmentsForHub(id: HubId) {
  const hub = hubById.get(id)!;
  return [
    ...new Set([
      ...hub.workspaceIds,
      hub.wiki,
      hub.portal,
      ...(hub.externalIds || []),
    ]),
  ]
    .map((environmentId) => environmentId && environmentById.get(environmentId))
    .filter((environment): environment is WorkspaceDefinition => !!environment);
}
export const hasWorkspaceTeams = (id: string) =>
  workspaceById.get(id)?.teams === true;
export const legacyRedirects: Record<string, string> = {
  "/quality-monitoring/change": "/projects/support",
  "/services/technology": "/digital-tech",
  "/services/projects": "/projects",
  "/services/legal": "/legal-compliance",
  "/services/hiring": "/employment-admin/recruitment-administration",
  "/services/resources": "/services",
  "/services/workplace": "/services/office",
  "/services/procurement": "/services/purchasing",
  "/services/coordination": "/services",
  "/services/systems/freshservice": "/service-desk/it-support",
  "/services/systems/jira": "/service-desk/it-support",
  "/services/systems/m365": "/digital-tech/m365",
  "/services/systems/greenhouse": "/employment-admin/systems/greenhouse",
  "/services/systems/recruitment": "/employment-admin/systems/greenhouse",
  "/services/systems/workday": "/employment-admin/systems/workday",
  "/people-culture/hiring": "/employment-admin/recruitment-administration",
  "/people-culture/hiring-documents":
    "/employment-admin/recruitment-administration",
  "/people-culture/employment": "/employment-admin/employment-operations",
  "/people-culture/systems/greenhouse": "/employment-admin/systems/greenhouse",
  "/people-culture/systems/recruitment": "/employment-admin/systems/greenhouse",
  "/people-culture/systems/workday": "/employment-admin/systems/workday",
  ...Object.fromEntries(
    employmentProtectedSubjects.map(([subject]) => [
      `/people-culture/protected/${subject}`,
      `/employment-admin/protected/${subject}`,
    ]),
  ),
  "/services/systems/asana": "/projects/support",
  "/services/systems/m-files": "/archives",
  "/services/systems/docuware": "/archives",
  "/services/systems/netsuite": "/financial-operations/systems/netsuite",
  "/services/systems/business-central":
    "/financial-operations/systems/netsuite",
  "/content-delivery/tools/piwik":
    "/audience-innovation/systems/website-analytics",
  "/content-delivery/tools/vwo": "/audience-innovation/experiments",
  "/content-delivery/tools/semrush": "/audience-innovation/analytics",
  "/content-delivery/tools/brandwatch": "/audience-innovation/analytics",
  "/content-delivery/tools/github": "/digital-tech/systems/github",
  "/content-delivery/tools/datadog": "/digital-tech/systems/datadog",
  "/content-delivery/packages/PKG-105/shared":
    "/digital-tech/web-crm/partner-review",
  "/content-delivery/packages/PKG-105/protected/security-note":
    "/digital-tech/protected/restricted-web",
  "/content-delivery/tools/staffbase": "/people-culture/communications",
};
export function resolveLegacy(path: string) {
  const welfareDestination = legacyWelfareDestination(path);
  if (welfareDestination) return welfareDestination;
  if (path === "/people-culture/protected")
    return "/employment-admin/protected";
  if (legacyRedirects[path]) return legacyRedirects[path];
  for (const [old, destination] of Object.entries(legacyRedirects).sort(
    (a, b) => b[0].length - a[0].length,
  )) {
    if (path.startsWith(old + "/")) {
      if (old === "/services/legal")
        return "/legal-compliance/protected/formal-cases";
      if (old === "/services/hiring")
        return "/employment-admin/protected/candidate-assessments";
      if (
        old === "/people-culture/hiring" ||
        old === "/people-culture/hiring-documents"
      )
        return legacyEmploymentBoundary(path, true);
      if (old === "/people-culture/employment")
        return legacyEmploymentBoundary(path, false);
      if (old === "/services/technology")
        return "/digital-tech/protected/privileged-access";
      if (old === "/services/workplace")
        return "/services/office/visitor-arrangements";
      if (old === "/services/procurement")
        return "/services/purchasing/live-tender";
      return destination;
    }
  }
  return undefined;
}
export const primaryDestinations: Record<string, string> = {
  "Q4 website-conversion analysis": "/audience-innovation/analytics",
  "CRM webhook bug": "/digital-tech/web-crm",
  "Customer complaint quality review": "/customer-relations/quality",
  "Organisation-wide process redesign": "/quality-monitoring/process",
  "Supplier sourcing file": "/services/purchasing",
  "Supplier invoice": "/financial-operations/payments",
  "Candidate assessment": "/employment-admin/protected/candidate-assessments",
  "Employment contract": "/employment-admin/protected/employee-records",
  "HR-system API change": "/digital-tech/systems-engineering",
  "Leadership development programme": "/people-culture/leadership",
  "Annual All-Staff Meeting agenda": "/people-culture/communications",
  "Company picnic planning": "/people-culture/communities",
  "Catering booking for picnic": "/services/reception",
  "Legal contract advice": "/legal-compliance/contracts",
  "External editorial production": "/content-delivery/creative",
  "CMS source-code change": "/digital-tech/web-crm",
  "Retention schedule": "/archives/retention",
  "SharePoint metadata implementation":
    "/digital-tech/information-architecture",
  "Historical final annual report": "/archives/collections",
  "Executive pre-decision paper": "/executive/leadership",
  "Formal project plan": "/projects/PRJ-2026-014",
};
export const crossWorkspaceHandoffs = [
  {
    id: "automation",
    name: "Journey automation",
    steps: [
      {
        name: "Audience hypothesis and measurement",
        href: "/audience-innovation/automation",
      },
      {
        name: "Message and content acceptance",
        href: "/content-delivery/digital",
      },
      {
        name: "CRM automation engineering",
        href: "/digital-tech/ai-automation",
      },
      {
        name: "Evaluate behaviour and performance",
        href: "/audience-innovation/analytics",
      },
    ],
  },
  {
    id: "starter",
    name: "New employee",
    steps: [
      {
        name: "Hiring and authorised employment process",
        href: "/employment-admin/recruitment-administration",
      },
      { name: "Office and reception readiness", href: "/services/office" },
      {
        name: "Account, system and device setup",
        href: "/digital-tech/operations",
      },
      { name: "Onboarding and capability", href: "/people-culture/learning" },
    ],
  },
  {
    id: "supplier",
    name: "Supplier onboarding",
    steps: [
      { name: "Sourcing and selection", href: "/services/purchasing" },
      {
        name: "Contract and privacy review",
        href: "/legal-compliance/contracts",
      },
      {
        name: "Payment and accounting",
        href: "/financial-operations/payments",
      },
      {
        name: "Systemic process improvement",
        href: "/quality-monitoring/process",
      },
    ],
  },
  {
    id: "records",
    name: "Closed work to archive",
    steps: [
      { name: "Approved business output", href: "/planning/approved" },
      { name: "Retention, appraisal and transfer", href: "/archives/transfer" },
      {
        name: "Technical storage control implementation",
        href: "/digital-tech/information-architecture",
      },
    ],
  },
  {
    id: "staff-comms",
    name: "Company communication",
    steps: [
      {
        name: "All-staff editorial and wiki publishing",
        href: "/people-culture/communications",
      },
      {
        name: "Technical intranet platform support",
        href: "/digital-tech/m365",
      },
      {
        name: "Preserve significant final material",
        href: "/archives/transfer",
      },
    ],
  },
];
