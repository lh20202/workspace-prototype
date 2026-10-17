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
}
const seed: [string, string, string, string, string, string][] = [
  [
    "projects",
    "Projects",
    "/projects",
    "Coordinate project governance and support, and access current and completed project workspaces.",
    "Project delivery",
    "projects",
  ],
  [
    "planning",
    "Organisational Planning & Reporting",
    "/planning",
    "Organisation-wide strategy, planning and formal performance reporting.",
    "Strategy & planning",
    "strategy",
  ],
  [
    "logistics",
    "Acquisition & Activation Logistics",
    "/logistics",
    "Operational deployment, rotas, locations, staffing coordination and direct-delivery logistics.",
    "Campaign operations",
    "people",
  ],
  [
    "audience",
    "Audience Research & Marketing Insight",
    "/audience-innovation",
    "Audience research, segmentation, journeys, behavioural insight, analysis, experimentation and marketing-automation ideation.",
    "Audience & experience",
    "research",
  ],
  [
    "content",
    "Content Room",
    "/content-delivery",
    "Shared production space for editorial, creative and channel teams coordinating live content, campaigns and rapid-response coverage.",
    "Audience & experience",
    "content",
  ],
  [
    "customer",
    "Customer Care & Relations",
    "/customer-relations",
    "Customer care, relationship continuity, account stewardship, partnerships and frontline interaction quality.",
    "Customer relationships",
    "customer",
  ],
  [
    "finance",
    "Income & Financial Operations",
    "/financial-operations",
    "Income administration, reconciliation, payments, accounting, financial planning and treasury.",
    "Financial operations",
    "finance",
  ],
  [
    "services",
    "Organisation Services",
    "/services",
    "Office maintenance and equipment, purchasing and suppliers, travel services and reception.",
    "Workplace operations",
    "services",
  ],
  [
    "quality",
    "Quality, Monitoring & Improvement",
    "/quality-monitoring",
    "Shared workspace for monitoring quality, improving processes, coordinating process improvement work and developing more effective and environmentally responsible ways of working.",
    "Improvement",
    "quality",
  ],
  [
    "digital",
    "Digital & Technology",
    "/digital-tech",
    "Shared engineering and technology workspace for building, operating and governing digital platforms, business systems, automation and emerging technology.",
    "Engineering & platforms",
    "digital",
  ],
  [
    "legal",
    "Legal, Privacy & Compliance",
    "/legal-compliance",
    "Shared workspace for legal review, privacy, compliance, organisational risk and assurance activity.",
    "Advice & assurance",
    "legal",
  ],
  [
    "people",
    "People & Culture",
    "/people-culture",
    "Workforce and organisation development, leadership, culture, inclusion, capability, staff communications and wellbeing programmes.",
    "People & organisation",
    "people-culture",
  ],
  [
    "employment",
    "Employment & Hiring Administration",
    "/employment-admin",
    "Shared controlled workspace for recruitment administration, employment records, contracts and authorised employment changes.",
    "Employment operations",
    "employment",
  ],
  [
    "executive",
    "CEO & Executive Committee",
    "/executive",
    "Executive coordination, restricted leadership work, governance liaison and strategic initiatives.",
    "Leadership & governance",
    "executive",
  ],
  [
    "archives",
    "Company Archives",
    "/archives",
    "Search, preserve and manage the company's historical records and organisational memory.",
    "Records & memory",
    "archives",
  ],
];
export const workspaceRegistry: WorkspaceDefinition[] = seed.map(
  ([id, title, href, description, group, icon]) => ({
    id,
    title,
    href,
    description,
    purpose: description,
    group,
    icon,
    teams: true,
    accessModel:
      "Shared functional work; sensitive subjects require specific participation",
    departmentRelationships: [],
  }),
);
export const workspaceById = new Map(workspaceRegistry.map((w) => [w.id, w]));
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
    [
      "candidate-applications",
      "candidate-assessments",
      "references",
      "offers",
      "placement",
      "employee-records",
      "employment-changes",
      "compensation",
      "employee-relations",
      "complaints",
      "welfare",
    ].map((subject) => [
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
      if (old === "/people-culture/hiring")
        return `/employment-admin/protected/${path.split("/")[3] || "candidate-assessments"}`;
      if (old === "/people-culture/employment")
        return `/employment-admin/protected/${path.split("/")[3] || "employment-changes"}`;
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
  "HR-system API change": "/digital-tech/systems-engineering",
  "Annual All-Staff Meeting agenda": "/people-culture/communications",
  "Company picnic planning": "/people-culture/communities",
  "Catering booking for picnic": "/services/reception",
  "Legal contract advice": "/legal-compliance/contracts",
  "Retention schedule": "/archives/retention",
  "SharePoint metadata implementation":
    "/digital-tech/information-architecture",
  "Historical final annual report": "/archives/collections",
  "Executive pre-decision paper": "/executive/leadership",
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
