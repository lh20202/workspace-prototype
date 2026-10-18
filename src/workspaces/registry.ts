import { workspaceSeed, workspaceAccessLevels } from "./accessClassification";
import type { WorkspaceAccessLevel } from "./accessClassification";
export { strictlyConfidentialWorkspaceIds } from "./accessClassification";
export type { WorkspaceAccessLevel } from "./accessClassification";
import { externalEnvironmentById } from "../environments/catalog";
import {
  employmentProtectedSubjects,
  legacyEmploymentBoundary,
} from "./employmentSubjects";
import { legacyWelfareDestination } from "./welfare";

export type HubId = "sales-marketing" | "infrastructure" | "personnel";
export type EnvironmentType = "workspace" | "portal" | "wiki";

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
    name: "North",
    icon: "organisation",
    description: "",
    workspaceIds: ["audience", "content", "logistics", "customer"],
    wiki: "sales-wiki",
    portal: "frontline-sales",
    externalIds: ["media-library"],
  },
  {
    id: "infrastructure",
    name: "East",
    externalIds: ["members"],
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
    name: "West",
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
  audience: "Laboratory",
  content: "Studio",
  logistics: "Acquisitions",
  customer: "Relations",
  executive: "CEO",
  planning: "Planning",
  projects: "Projects",
  quality: "Quality",
  legal: "Legal",
  services: "Services",
  digital: "Tech",
  archives: "Archives",
  employment: "Employment & Hiring",
};

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

export const workspaceRegistry: WorkspaceDefinition[] = workspaceSeed.map(
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
    accessLevel: workspaceAccessLevels[id],
    environmentType: "workspace",
    accessModel:
      workspaceAccessLevels[id] === "strictly-confidential"
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
    title: "Advertising, Marketing & Sales Wiki",
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
    hubLabel: "Advertising, Marketing & Sales Wiki",
    accessLevel: "internal",
    environmentType: "wiki",
  },
  ...[
    [
      "frontline-sales",
      "Local crew portal",
      "/frontline-sales",
      "sales-marketing",
      "Day-to-day frontline information and tools",
    ],
    [
      "media-library",
      "Media Library",
      "/external/media-library",
      "sales-marketing",
      "Global media and approved visual resources",
    ],
    [
      "members",
      "Membership Portal",
      "/governance",
      "infrastructure",
      "Formal member and governance environment",
    ],
    [
      "taskforce",
      "International Crew Portal",
      "/external/taskforce",
      "personnel",
      "International crew information and coordination",
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
