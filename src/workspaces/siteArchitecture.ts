import type {
  LibraryDefinition,
  LibraryColumn,
  LibraryDocument,
} from "../sharepoint/library";
import type { FunctionalConfig, WorkingFile } from "./types";
import { workspaceById } from "./registry";
import { welfareFilesForPerson } from "./welfare";

export interface FunctionalLibrary extends LibraryDefinition {
  areas: string[];
  aliases?: string[];
}
const column = (
  key: string,
  label = key,
  type: LibraryColumn["type"] = "text",
): LibraryColumn => ({ key, label, type });
const common = [
  column("status", "Status", "choice"),
  column("owner", "Owner"),
  column("modified", "Modified", "date"),
];
const all = { id: "all", name: "All Documents" };
const review = {
  id: "review",
  name: "Needs review",
  filters: [
    { field: "status", value: "review", operator: "contains" as const },
  ],
  recursive: true,
};
const recent = {
  id: "recent",
  name: "Recently changed",
  sortBy: "modified",
  descending: true,
  recursive: true,
};
function library(
  id: string,
  name: string,
  areas: string[],
  purpose: string,
  business: LibraryColumn[],
  extra: Partial<FunctionalLibrary> = {},
): FunctionalLibrary {
  return {
    id,
    name,
    areas,
    purpose,
    columns: [column("name", "Name"), business[0], ...common],
    fields: business,
    views: [all, recent, review],
    ...extra,
  };
}
export const functionalLibraries: Record<string, FunctionalLibrary[]> = {
  welfare: [
    library(
      "welfare-support",
      "Welfare & Psychosocial Support",
      ["welfare-support"],
      "Protected support methods and non-identifiable coordination.",
      [column("Scope")],
    ),
    library(
      "safeguarding-complaints",
      "Safeguarding & Complaints",
      ["safeguarding-complaints"],
      "Protected reporting and referral methods.",
      [column("Scope")],
    ),
    library(
      "employee-representation",
      "Employee Representation",
      ["employee-representation"],
      "Independent representative preparation; separate participant membership.",
      [column("Scope")],
    ),
    library(
      "approved-consultation",
      "Approved consultation outputs",
      ["approved-consultation"],
      "Agreed, non-identifiable outputs shared across the protected areas.",
      [column("Scope")],
    ),
  ],
  services: [
    library(
      "service-operations",
      "Service Operations",
      ["office", "reception"],
      "Maintain office equipment and keep front-desk services ready.",
      [
        column("Activity"),
        column("Service owner"),
        column("Review date", "Review date", "date"),
      ],
      { aliases: ["documents"] },
    ),
    library(
      "purchasing-suppliers",
      "Purchasing & Suppliers",
      ["purchasing"],
      "Prepare sourcing decisions, supplier onboarding and renewal reviews.",
      [
        column("Supplier"),
        column("Activity"),
        column("Review date", "Review date", "date"),
      ],
      {
        columns: [
          column("name", "Name"),
          column("Supplier"),
          column("status", "Stage"),
          column("owner", "Owner"),
          column("modified", "Modified", "date"),
        ],
        contentTypes: [
          {
            id: "supplier-evaluation",
            name: "Supplier Evaluation",
            extension: "xlsx",
            template: "Evaluation criteria, evidence and commercial comparison",
            fields: ["Supplier", "Activity"],
            defaults: { Activity: "Sourcing" },
          },
          {
            id: "supplier-decision",
            name: "Supplier Decision",
            extension: "docx",
            template: "Decision, rationale and renewal or onboarding actions",
            fields: ["Supplier", "Review date"],
            defaults: { Activity: "Decision" },
          },
        ],
        views: [
          all,
          {
            id: "supplier",
            name: "By supplier",
            sortBy: "Supplier",
            recursive: true,
          },
          review,
        ],
      },
    ),
    library(
      "bookings-coordination",
      "Bookings & Coordination",
      ["travel", "reception"],
      "Coordinate group travel and visitor bookings without personal itineraries.",
      [
        column("Activity"),
        column("Booking period"),
        column("Coordination date", "Coordination date", "date"),
      ],
      {
        views: [
          all,
          {
            id: "upcoming",
            name: "October coordination",
            filters: [{ field: "Booking period", value: "October 2026" }],
            recursive: true,
          },
          recent,
        ],
      },
    ),
  ],
  quality: [
    library(
      "quality-documents",
      "Quality",
      ["monitoring", "reviews"],
      "Review service quality, evidence and corrective actions.",
      [
        column("Review cycle"),
        column("Process"),
        column("Review date", "Review date", "date"),
      ],
    ),
    library(
      "improvement-documents",
      "Process & Improvement",
      ["process", "improvement"],
      "Map process changes and test agreed improvements.",
      [
        column("Process"),
        column("Activity"),
        column("Review date", "Review date", "date"),
      ],
      {
        contentTypes: [
          {
            id: "process-review",
            name: "Process Review",
            extension: "docx",
            fields: ["Process", "Review date"],
            template:
              "Current flow, evidence, bottlenecks and proposed changes",
          },
          {
            id: "improvement-brief",
            name: "Improvement Brief",
            extension: "docx",
            fields: ["Process", "Activity"],
            template: "Problem, improvement hypothesis and measure of success",
          },
        ],
      },
    ),
    library(
      "eco-documents",
      "Eco Practice",
      ["eco"],
      "Develop lower-impact operating practices and review pilot results.",
      [
        column("Initiative"),
        column("Activity"),
        column("Review date", "Review date", "date"),
      ],
      {
        views: [
          all,
          {
            id: "initiative",
            name: "By initiative",
            sortBy: "Initiative",
            recursive: true,
          },
          review,
        ],
      },
    ),
  ],
  digital: [
    library(
      "engineering-documents",
      "Engineering Delivery",
      [
        "engineering",
        "web-crm",
        "systems-engineering",
        "ai-automation",
        "m365",
      ],
      "Design, test and prepare technical platform changes.",
      [
        column("Platform"),
        column("Activity"),
        column("Release"),
        column("Review date", "Review date", "date"),
      ],
      {
        views: [
          all,
          {
            id: "release",
            name: "Release readiness",
            filters: [
              { field: "Activity", value: "Release", operator: "contains" },
            ],
            recursive: true,
          },
          review,
          recent,
        ],
      },
    ),
    library(
      "architecture-documents",
      "Architecture & Decisions",
      ["information-architecture", "architecture"],
      "Record design decisions and the implementation of agreed information architecture.",
      [
        column("Platform"),
        column("Decision scope"),
        column("Review date", "Review date", "date"),
      ],
      {
        contentTypes: [
          {
            id: "technical-decision",
            name: "Architecture Decision",
            extension: "docx",
            fields: ["Platform", "Decision scope"],
            template: "Context, options, decision and consequences",
          },
          {
            id: "implementation-design",
            name: "Implementation Design",
            extension: "docx",
            fields: ["Platform", "Review date"],
            template: "Configuration, mapping, validation and rollback",
          },
        ],
        views: [
          all,
          {
            id: "decisions",
            name: "Decision records",
            filters: [{ field: "contentType", value: "technical-decision" }],
            recursive: true,
          },
          review,
        ],
      },
    ),
    library(
      "operations-documents",
      "Platform Operations",
      ["operations"],
      "Prepare service changes, operational handoffs and recovery exercises.",
      [
        column("Service"),
        column("Activity"),
        column("Change window", "Change window", "date"),
      ],
    ),
  ],
  legal: [
    library(
      "legal-documents",
      "Advice, Compliance & Policy",
      ["review", "compliance", "policy"],
      "Coordinate shared review methods, obligations and policy changes.",
      [
        column("Work type"),
        column("Review cycle"),
        column("Review date", "Review date", "date"),
      ],
      {
        contentTypes: [
          {
            id: "policy-review",
            name: "Policy Review",
            extension: "docx",
            fields: ["Work type", "Review date"],
            template: "Proposed change, consultation and publication handoff",
            defaults: { "Work type": "Policy" },
          },
          {
            id: "compliance-review",
            name: "Compliance Review",
            extension: "docx",
            fields: ["Review cycle", "Review date"],
            template: "Obligations, evidence owners and review outcome",
            defaults: { "Work type": "Compliance" },
          },
        ],
      },
    ),
    library(
      "privacy-documents",
      "Privacy & Assurance",
      ["privacy", "risk", "audit"],
      "Maintain assessment methods and coordinate assurance evidence.",
      [
        column("Assessment"),
        column("Review cycle"),
        column("Review date", "Review date", "date"),
      ],
    ),
    library(
      "contract-documents",
      "Contract Review",
      ["contracts"],
      "Prepare the business review and approval handoff; privileged advice stays protected.",
      [
        column("Agreement type"),
        column("Activity"),
        column("Review date", "Review date", "date"),
      ],
    ),
  ],
  people: [
    library(
      "workforce-documents",
      "Workforce",
      [
        "workforce",
        "culture",
        "frameworks",
        "communities",
        "analytics",
        "wellbeing",
      ],
      "Develop shared workforce methods, staff programmes and aggregate planning.",
      [
        column("Programme"),
        column("Activity"),
        column("Review date", "Review date", "date"),
      ],
    ),
    library(
      "learning-documents",
      "Curriculum",
      ["learning"],
      "Design learning programmes and review aggregate feedback.",
      [
        column("Programme"),
        column("Audience"),
        column("Review date", "Review date", "date"),
      ],
      {
        contentTypes: [
          {
            id: "learning-plan",
            name: "Learning Plan",
            extension: "docx",
            fields: ["Programme", "Audience"],
            template: "Learning outcomes, activities and facilitation plan",
          },
          {
            id: "programme-review",
            name: "Programme Review",
            extension: "docx",
            fields: ["Programme", "Review date"],
            template: "Aggregate feedback, outcome and next learning cycle",
          },
        ],
      },
    ),
    library(
      "communications-documents",
      "Staff Communications",
      ["communications"],
      "Prepare all-staff meetings and publish intranet updates.",
      [
        column("Channel"),
        column("Publication date", "Publication date", "date"),
        column("Activity"),
      ],
      {
        views: [
          all,
          {
            id: "channel",
            name: "By channel",
            sortBy: "Channel",
            recursive: true,
          },
          review,
        ],
      },
    ),
  ],
  employment: [
    library(
      "recruitment-administration",
      "Recruitment Administration",
      ["hiring"],
      "Coordinate vacancy setup, panels and recruitment handoffs. Candidate applications, assessments, references and decisions require separate authorisation.",
      [
        column("Activity"),
        column("Recruitment stage"),
        column("Review date", "Review date", "date"),
      ],
      {
        aliases: ["hiring", "hiring-documents"],
        contentTypes: [
          {
            id: "vacancy-coordination",
            name: "Vacancy Coordination",
            extension: "docx",
            fields: ["Activity", "Recruitment stage"],
            template:
              "Vacancy setup, approval route, panel preparation and shared milestones; no candidate details",
            defaults: { "Recruitment stage": "Vacancy setup" },
          },
          {
            id: "recruitment-handoff",
            name: "Recruitment Handoff",
            extension: "docx",
            fields: ["Activity", "Review date"],
            template:
              "Process responsibilities, readiness checks and the authorised system handoff; no candidate details",
            defaults: { "Recruitment stage": "Handoff" },
          },
        ],
        views: [
          all,
          {
            id: "stage",
            name: "By recruitment stage",
            sortBy: "Recruitment stage",
            recursive: true,
          },
          review,
        ],
      },
    ),
    library(
      "employment-operations",
      "Employment Operations",
      ["employment", "inputs"],
      "Shared change-control methods and employment-system handoffs. Individual contracts, employment changes and payroll inputs remain restricted.",
      [
        column("Activity"),
        column("System of record"),
        column("Review date", "Review date", "date"),
      ],
      {
        aliases: ["employment", "changes", "payroll"],
        contentTypes: [
          {
            id: "employment-process",
            name: "Employment Process",
            extension: "docx",
            fields: ["Activity", "System of record"],
            template:
              "Authorisation route, process checks and system responsibilities; no individual records",
            defaults: { "System of record": "Workday HCM" },
          },
        ],
      },
    ),
  ],
  customer: [
    library(
      "care-documents",
      "Care Standards & Quality",
      ["care", "premium", "quality"],
      "Review care methods, service themes and coaching without personal case records.",
      [
        column("Activity"),
        column("Review cycle"),
        column("Review date", "Review date", "date"),
      ],
    ),
    library(
      "relationship-documents",
      "Relationships & Accounts",
      ["relationships", "accounts", "partnerships", "stakeholders"],
      "Prepare stewardship methods and shared relationship planning.",
      [
        column("Relationship type"),
        column("Activity"),
        column("Review date", "Review date", "date"),
      ],
    ),
    library(
      "meeting-documents",
      "Meetings & Negotiations",
      ["meetings"],
      "Prepare meeting briefs and follow through on agreed business actions.",
      [
        column("Activity"),
        column("Meeting cycle"),
        column("Review date", "Review date", "date"),
      ],
      {
        contentTypes: [
          {
            id: "meeting-brief",
            name: "Meeting Brief",
            extension: "docx",
            fields: ["Activity", "Meeting cycle"],
            template: "Purpose, agenda, preparation and agreed follow-up",
          },
          {
            id: "negotiation-plan",
            name: "Negotiation Plan",
            extension: "docx",
            fields: ["Activity", "Review date"],
            template: "Objectives, options, authority and escalation route",
          },
        ],
      },
    ),
  ],
  archives: [
    library(
      "archive-practice",
      "Archive Practice & Transfers",
      ["retention", "transfer", "cataloguing", "preservation", "projects"],
      "Working appraisal, description and preservation documents, separate from the controlled catalogue.",
      [
        column("Activity"),
        column("Record series"),
        column("Review date", "Review date", "date"),
      ],
      {
        aliases: ["working-documents"],
        views: [
          all,
          {
            id: "activity",
            name: "By activity",
            sortBy: "Activity",
            recursive: true,
          },
          recent,
        ],
      },
    ),
  ],
};

export function functionalFolder(file: WorkingFile) {
  return file.folderPath || file.folder;
}
export function libraryForFile(config: FunctionalConfig, fileId: string) {
  const file = config.files.find((f) => f.id === fileId);
  return functionalLibraries[config.id]?.find(
    (l) => l.id === file?.documentLibrary,
  );
}
export function functionalFileHref(config: FunctionalConfig, fileId: string) {
  const file = config.files.find((candidate) => candidate.id === fileId);
  const library = libraryForFile(config, fileId);
  const base = workspaceById.get(config.id)?.href || "/architecture";
  return file && library
    ? `${base}/${library.id}?${new URLSearchParams({ library: library.name, folder: functionalFolder(file), file: file.id })}`
    : base;
}
export function functionalLibraryDocuments(
  config: FunctionalConfig,
  library: FunctionalLibrary,
  personId?: string,
): LibraryDocument[] {
  const files =
    config.id === "welfare"
      ? welfareFilesForPerson(personId || "")
      : config.files;
  return files.filter((file) => file.documentLibrary === library.id);
}

export const protectedNavigation: Record<string, string> = {
  digital: "Protected Technology",
  people: "Private Staff Communities",
  employment: "Restricted Information",
  customer: "Protected Customer Matters",
};
export const protectedHeading: Record<string, string> = {
  services: "Commercial & Visitor Access",
  digital: "Protected Technology",
  legal: "Protected Legal Matters",
  people: "Private Staff Communities",
  employment: "Restricted Employment Information",
  customer: "Protected Customer Matters",
};

export interface FunctionalHome {
  heading: string;
  context: string;
  areas: string[];
  recentHeading: string;
  handoffs: { label: string; href: string }[];
  handoffsHeading?: string;
  teams?: { heading: string; cue: string };
}
export const functionalHomes: Record<string, FunctionalHome> = {
  services: {
    heading: "Office & booking readiness",
    context:
      "This week: equipment replacement, supplier onboarding and October group travel.",
    areas: ["office", "purchasing", "travel"],
    recentHeading: "Ready for the next handoff",
    handoffs: [
      {
        label: "Raise a facilities request",
        href: "/services/systems/maintainx",
      },
      { label: "Make a travel booking", href: "/services/systems/travelperk" },
      {
        label: "Route a supplier payment",
        href: "/financial-operations/payments",
      },
    ],
  },
  quality: {
    heading: "October quality review",
    context:
      "Review recurring handover delays and agree the next service improvement trial.",
    areas: ["monitoring", "process", "improvement"],
    recentHeading: "Review evidence & working changes",
    handoffs: [
      {
        label: "Review corrective actions",
        href: "/quality-monitoring/actions?view=Needs%20review",
      },
      {
        label: "Open process mapping",
        href: "/quality-monitoring/systems/lucidchart",
      },
    ],
  },
  digital: {
    heading: "Platform changes in review",
    context:
      "Release readiness, local AI evaluation and the M365 search rollout are the current engineering focus.",
    areas: ["web-crm", "ai-automation", "m365"],
    recentHeading: "Designs & release preparation",
    handoffs: [
      {
        label: "Review the engineering backlog",
        href: "/digital-tech/systems/github?repo=company-web&kind=repository",
      },
      { label: "Request IT support", href: "/service-desk/it-support" },
    ],
    teams: {
      heading: "Technical coordination",
      cue: "Discuss the current design and release reviews.",
    },
  },
  legal: {
    heading: "Quarterly review coordination",
    context:
      "Prepare the policy review cycle, processing assessments and evidence-owner handoffs.",
    areas: ["policy", "privacy", "compliance"],
    recentHeading: "Shared review methods",
    handoffs: [
      {
        label: "Supplier sourcing context",
        href: "/services/purchasing-suppliers",
      },
    ],
  },
  people: {
    heading: "Learning & staff programme planning",
    context:
      "Prepare the manager capability pilot, October all-staff meeting and shared workforce contributions.",
    areas: ["learning", "communications", "workforce"],
    recentHeading: "Upcoming programme material",
    handoffs: [
      {
        label: "Prepare an all-staff update",
        href: "/people-culture/communications-documents?folder=All-staff%20meetings%2FOctober%202026&library=Staff%20Communications",
      },
      {
        label: "Recruitment & employment administration",
        href: "/employment-admin",
      },
      {
        label: "Find an open staff network",
        href: "/people-culture/communities",
      },
    ],
    handoffsHeading: "Programme shortcuts",
  },
  employment: {
    heading: "Recruitment & employment readiness",
    context:
      "Coordinate shared vacancy preparation and approved process handoffs. Individual employment matters are handled only in their authorised records or systems.",
    areas: ["hiring", "employment"],
    recentHeading: "Shared procedures & preparation",
    handoffsHeading: "Authoritative systems",
    handoffs: [
      {
        label: "Open Greenhouse Recruiting",
        href: "/employment-admin/systems/greenhouse",
      },
      { label: "Open Workday HCM", href: "/employment-admin/systems/workday" },
      {
        label: "Learning & induction programmes",
        href: "/people-culture/learning",
      },
    ],
  },
  customer: {
    heading: "Care review & relationship continuity",
    context:
      "Review recurring enquiry themes and the next coaching cycle, then prepare relationship follow-up.",
    areas: ["care", "quality", "relationships"],
    recentHeading: "Methods for the next conversation",
    handoffs: [
      {
        label: "Open authorised care cases",
        href: "/customer-relations/systems/zendesk",
      },
      {
        label: "Review relationship follow-up",
        href: "/customer-relations/actions?view=Current",
      },
      {
        label: "Open the relationship system",
        href: "/customer-relations/systems/hubspot",
      },
    ],
  },
};
