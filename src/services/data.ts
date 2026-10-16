import type { OperationalFile } from "../logistics/data";
export const title = "Organisation Services";
export const purpose =
  "Shared workspace for teams that provide internal organisational services, coordinate requests and handovers, and maintain the standards, tools and resources needed to support colleagues across the organisation.";
export const description =
  "Shared workspace for internal service teams coordinating technology, projects, legal and compliance support, purchasing, workplace services and hiring.";
export const areas = [
  {
    id: "coordination",
    name: "Service Coordination",
    summary:
      "Coordinate ownership, service routes and work that crosses several services.",
    folders: [],
  },
  {
    id: "projects",
    name: "Projects & Improvement",
    summary:
      "Support project intake, assessment, delivery, process improvement and adoption.",
    folders: [
      "Project intake & assessment",
      "Business cases",
      "Active project support",
      "Process improvement",
      "Change & adoption",
      "Project closure & handover",
      "Methods & templates",
    ],
  },
  {
    id: "technology",
    name: "Technology Services",
    summary:
      "First- and second-level support, service procedures and technical governance. Requests and incidents are managed in Jira Service Management.",
    folders: [
      "IT service management",
      "User support",
      "Devices & hardware",
      "Accounts & access",
      "Applications & platforms",
      "System change & release",
      "Technical standards",
      "Service continuity",
    ],
  },
  {
    id: "legal",
    name: "Legal, Risk & Compliance",
    summary:
      "Shared guidance, approved templates, risk methods and assurance. Access is narrower for specific matters only.",
    folders: [
      "Legal guidance",
      "Contract review guidance",
      "Privacy guidance",
      "Risk & Assurance",
      "Compliance standards",
      "Audit guidance",
      "Guidance & Templates",
    ],
  },
  {
    id: "procurement",
    name: "Purchasing & Suppliers",
    summary:
      "Common purchasing methods, supplier assurance and renewal planning. Transactions remain in Business Central.",
    folders: [
      "Procurement intake",
      "Sourcing methods",
      "Supplier onboarding",
      "Supplier assurance",
      "Contracts & frameworks",
      "Supplier performance",
      "Renewals & exit",
      "Guidance & templates",
    ],
  },
  {
    id: "workplace",
    name: "Workplace & Travel",
    summary:
      "Coordinate reception, workplace support, office moves, meeting logistics and travel guidance.",
    folders: [
      "Reception & front desk",
      "Rooms & workplace services",
      "Office access",
      "Repairs & maintenance",
      "Office moves",
      "Travel support",
      "Mail & deliveries",
      "Meeting logistics",
      "Facilities suppliers",
    ],
  },
  {
    id: "hiring",
    name: "Hiring Services",
    summary:
      "Support vacancy setup, attraction, selection and offer handover. Continuing employee administration belongs elsewhere; applications remain in the Recruitment Portal.",
    folders: [
      "Vacancy setup",
      "Role and selection criteria",
      "Advertising coordination",
      "Hiring-manager support",
      "Interview and assessment planning",
      "Selection process guidance",
      "Offer handover",
      "Recruitment process improvement",
    ],
  },
  {
    id: "resources",
    name: "Shared Resources",
    summary:
      "One set of reusable standards, methods and handover resources used across internal services.",
    folders: ["Service standards", "Common templates", "Handover resources"],
  },
];
export type ServiceFile = OperationalFile & {
  area: string;
  workType: string;
  reference: string;
};
const make = (
  id: string,
  area: string,
  folder: string,
  name: string,
  workType = "Guidance",
  owner = "Maya Chen",
  reference = "",
): ServiceFile => ({
  id,
  area,
  name,
  folder,
  workType,
  owner,
  reference,
  library: "resources",
  campaign: areas.find((a) => a.id === area)!.name,
  operation: "Shared operations",
  location: "Organisation Services",
  type: name.split(".").at(-1)!,
  status: "Current",
  validFrom: "2026-10-01",
  validTo: "2026-12-31",
  modified: "2026-10-14",
  sensitivity: "Internal",
  recordState: "Current resource",
});
export const documents: ServiceFile[] = [
  make(
    "project-intake",
    "projects",
    "Project intake & assessment",
    "Project intake checklist.docx",
    "Checklist",
    "Alex Morgan",
  ),
  make(
    "business-case",
    "projects",
    "Business cases",
    "Business case template.docx",
    "Template",
  ),
  make(
    "project-status",
    "projects",
    "Active project support",
    "Project status template.pptx",
    "Template",
  ),
  make(
    "process-mapping",
    "projects",
    "Process improvement",
    "Process mapping guide.docx",
  ),
  make(
    "change-readiness",
    "projects",
    "Change & adoption",
    "Change readiness checklist.docx",
    "Checklist",
  ),
  make(
    "project-closure",
    "projects",
    "Project closure & handover",
    "Project closure checklist.docx",
    "Handover",
    "Alex Morgan",
  ),
  make(
    "risk-issue",
    "projects",
    "Methods & templates",
    "Risk and issue log.xlsx",
    "Register",
  ),
  make(
    "incident-checklist",
    "technology",
    "IT service management",
    "Major incident checklist.docx",
    "Service procedure",
    "Sam Patel",
    "JSM-2481",
  ),
  make(
    "support-handover",
    "technology",
    "User support",
    "Technical service handover.docx",
    "Handover",
    "Sam Patel",
  ),
  make(
    "laptop-setup",
    "technology",
    "Devices & hardware",
    "Laptop setup standard.docx",
    "Service procedure",
  ),
  make(
    "account-access",
    "technology",
    "Accounts & access",
    "Account access checklist.docx",
    "Checklist",
  ),
  make(
    "software-approval",
    "technology",
    "Applications & platforms",
    "Software approval guide.docx",
    "Guidance",
    "Sam Patel",
  ),
  make(
    "system-change",
    "technology",
    "System change & release",
    "System change template.docx",
    "Template",
  ),
  make(
    "app-register",
    "technology",
    "Technical standards",
    "Application ownership register.xlsx",
    "Register",
  ),
  make(
    "continuity",
    "technology",
    "Service continuity",
    "Service continuity procedure.docx",
    "Service procedure",
  ),
  make("legal-hold", "legal", "Legal guidance", "Legal hold guidance.docx"),
  make(
    "contract-review",
    "legal",
    "Contract review guidance",
    "Contract review checklist.docx",
    "Checklist",
    "Jordan Lee",
    "DW-883",
  ),
  make(
    "privacy-review",
    "legal",
    "Privacy guidance",
    "Privacy review guide.docx",
  ),
  make(
    "compliance",
    "legal",
    "Compliance standards",
    "Compliance review checklist.docx",
    "Checklist",
  ),
  make("audit", "legal", "Audit guidance", "Audit preparation guide.docx"),
  make(
    "data-processing",
    "legal",
    "Guidance & Templates",
    "Data-processing assessment template.docx",
    "Template",
  ),
  make(
    "purchase-guide",
    "procurement",
    "Procurement intake",
    "Purchase request guide.docx",
    "Guidance",
    "Jamie Brooks",
    "PO-1047",
  ),
  make(
    "quotation",
    "procurement",
    "Sourcing methods",
    "Request for quotation template.docx",
    "Template",
  ),
  make(
    "supplier-onboarding",
    "procurement",
    "Supplier onboarding",
    "Supplier onboarding checklist.docx",
    "Checklist",
    "Jamie Brooks",
  ),
  make(
    "supplier-diligence",
    "procurement",
    "Supplier assurance",
    "Supplier due-diligence checklist.docx",
    "Checklist",
  ),
  make(
    "framework",
    "procurement",
    "Contracts & frameworks",
    "Framework use guide.docx",
  ),
  make(
    "supplier-performance",
    "procurement",
    "Supplier performance",
    "Supplier review template.xlsx",
    "Template",
  ),
  make(
    "contract-renewal",
    "procurement",
    "Renewals & exit",
    "Contract renewal checklist.docx",
    "Checklist",
  ),
  make(
    "evaluation",
    "procurement",
    "Guidance & templates",
    "Evaluation template.xlsx",
    "Template",
  ),
  make(
    "visitor",
    "workplace",
    "Reception & front desk",
    "Visitor procedure.docx",
    "Service procedure",
  ),
  make(
    "meeting-room",
    "workplace",
    "Rooms & workplace services",
    "Meeting room guide.docx",
  ),
  make(
    "office-access",
    "workplace",
    "Office access",
    "Office access guide.docx",
  ),
  make(
    "facilities-issue",
    "workplace",
    "Repairs & maintenance",
    "Facilities issue escalation.docx",
    "Service procedure",
  ),
  make(
    "office-move",
    "workplace",
    "Office moves",
    "Office move checklist.docx",
    "Checklist",
  ),
  make(
    "travel-booking",
    "workplace",
    "Travel support",
    "Travel booking guide.docx",
    "Guidance",
    "Jordan Lee",
  ),
  make(
    "mail",
    "workplace",
    "Mail & deliveries",
    "Delivery handling guide.docx",
  ),
  make(
    "meeting-logistics",
    "workplace",
    "Meeting logistics",
    "Meeting logistics checklist.docx",
    "Checklist",
  ),
  make(
    "facilities-supplier",
    "workplace",
    "Facilities suppliers",
    "Facilities supplier handover.docx",
    "Handover",
  ),
  make(
    "hiring-request",
    "hiring",
    "Vacancy setup",
    "Hiring request checklist.docx",
    "Checklist",
    "Jordan Lee",
    "REC-221",
  ),
  make(
    "job-profile",
    "hiring",
    "Role and selection criteria",
    "Job profile template.docx",
    "Template",
  ),
  make(
    "recruitment-timeline",
    "hiring",
    "Advertising coordination",
    "Recruitment timeline template.xlsx",
    "Template",
  ),
  make(
    "hiring-manager",
    "hiring",
    "Hiring-manager support",
    "Hiring-manager support guide.docx",
  ),
  make(
    "interview-plan",
    "hiring",
    "Interview and assessment planning",
    "Interview planning guide.docx",
  ),
  make(
    "interview-panel",
    "hiring",
    "Selection process guidance",
    "Interview panel guide.docx",
    "Guidance",
    "Jordan Lee",
  ),
  make(
    "offer-handover",
    "hiring",
    "Offer handover",
    "Offer handover checklist.docx",
    "Handover",
    "Jordan Lee",
  ),
  make(
    "hiring-improvement",
    "hiring",
    "Recruitment process improvement",
    "Recruitment process review template.docx",
    "Template",
  ),
  make(
    "service-standards",
    "resources",
    "Service standards",
    "Service request standards.docx",
    "Service procedure",
  ),
  make(
    "service-owner",
    "resources",
    "Service standards",
    "Service owner guide.docx",
  ),
  make(
    "glossary",
    "resources",
    "Service standards",
    "Internal service glossary.docx",
  ),
  make(
    "handover",
    "resources",
    "Handover resources",
    "Handover checklist.docx",
    "Handover",
  ),
  make(
    "change-comms",
    "resources",
    "Handover resources",
    "Change communication checklist.docx",
    "Checklist",
  ),
  make(
    "decision-log",
    "resources",
    "Common templates",
    "Decision log template.docx",
    "Template",
  ),
  make(
    "supplier-assessment",
    "resources",
    "Common templates",
    "Supplier assessment template.xlsx",
    "Template",
  ),
  make(
    "risk-assessment",
    "resources",
    "Common templates",
    "Risk assessment template.xlsx",
    "Template",
  ),
  make(
    "project-brief",
    "resources",
    "Common templates",
    "Project brief template.docx",
    "Template",
  ),
];
export const filesById = new Map(documents.map((d) => [d.id, d]));
export const sharedReferences: Record<string, string[]> = {
  projects: ["project-brief", "risk-assessment", "decision-log", "handover"],
  technology: ["handover", "change-comms"],
  legal: ["risk-assessment", "decision-log"],
  procurement: ["supplier-assessment", "risk-assessment"],
  workplace: ["handover", "service-standards"],
  hiring: ["handover", "change-comms"],
};
export const matters = [
  {
    id: "DIS-006",
    area: "legal",
    segment: "matters",
    name: "Active disputes & claims — DIS-006",
  },
  {
    id: "INV-008",
    area: "legal",
    segment: "matters",
    name: "Investigations & protected disclosures — INV-008",
  },
  {
    id: "PI-014",
    area: "legal",
    segment: "matters",
    name: "Privacy incidents & rights requests — PI-014",
  },
  {
    id: "ADV-012",
    area: "legal",
    segment: "matters",
    name: "Sensitive legal advice — ADV-012",
  },
  {
    id: "TND-014",
    area: "procurement",
    segment: "tenders",
    name: "Live tender evaluation — Workplace Services Framework",
  },
  {
    id: "NEG-011",
    area: "procurement",
    segment: "matters",
    name: "Commercial negotiation — NEG-011",
  },
  {
    id: "DD-009",
    area: "procurement",
    segment: "matters",
    name: "Supplier due diligence — DD-009",
  },
  {
    id: "SUP-007",
    area: "procurement",
    segment: "matters",
    name: "Sensitive supplier issue — SUP-007",
  },
  {
    id: "SEC-017",
    area: "technology",
    segment: "matters",
    name: "Cybersecurity incident response — SEC-017",
  },
  {
    id: "ACC-004",
    area: "technology",
    segment: "matters",
    name: "Privileged access administration — ACC-004",
  },
  {
    id: "VUL-009",
    area: "technology",
    segment: "matters",
    name: "Security vulnerability review — VUL-009",
  },
  {
    id: "RECOVERY-003",
    area: "technology",
    segment: "matters",
    name: "Critical infrastructure recovery — RECOVERY-003",
  },
  {
    id: "REC-221",
    area: "hiring",
    segment: "recruitment",
    name: "Digital Services Manager — Candidate assessment",
  },
  {
    id: "REC-224",
    area: "hiring",
    segment: "recruitment",
    name: "Procurement Specialist — References & offer",
  },
  {
    id: "APP-221",
    area: "hiring",
    segment: "recruitment",
    name: "Candidate applications — Digital Services Manager",
  },
  {
    id: "SEC-005",
    area: "workplace",
    segment: "matters",
    name: "Physical security incident — SEC-005",
  },
  {
    id: "ACCESS-008",
    area: "workplace",
    segment: "matters",
    name: "Sensitive building-access review — ACCESS-008",
  },
  {
    id: "EMR-002",
    area: "workplace",
    segment: "matters",
    name: "Emergency access arrangements — EMR-002",
  },
];
export const matterHref = (m: (typeof matters)[number]) =>
  `/services/${m.area}/${m.segment}/${m.id}`;
export const systems = [
  {
    id: "jira",
    name: "Jira Service Management",
    purpose: "IT requests, incidents and technical support",
    initials: "JSM",
    color: "#0c66e4",
  },
  {
    id: "business-central",
    name: "Microsoft Dynamics 365 Business Central",
    purpose: "Purchasing, budget and transaction references",
    initials: "BC",
    color: "#007e87",
  },
  {
    id: "docuware",
    name: "DocuWare",
    purpose: "Document workflows and controlled records",
    initials: "DW",
    color: "#1767a2",
  },
  {
    id: "recruitment",
    name: "Recruitment Portal",
    purpose: "Vacancies, applications and candidate workflow",
    initials: "REC",
    color: "#6750a4",
  },
  {
    id: "m365",
    name: "Microsoft 365",
    purpose: "Collaboration, meetings and shared working tools",
    initials: "M365",
    color: "#d83b01",
  },
];
export const systemHref = (id: string) =>
  id === "jira" ? "/service-desk/it-support" : `/services/systems/${id}`;
export const directory = [
  {
    service: "Laptop or software support",
    supports: "Device setup, approved software and support",
    area: "technology",
    route: "IT request",
    system: "jira",
    owner: "Sam Patel",
    handoff: "First-level triage → second-level application support",
  },
  {
    service: "New supplier setup",
    supports: "Supplier assurance and purchasing readiness",
    area: "procurement",
    route: "Supplier onboarding",
    system: "business-central",
    owner: "Jamie Brooks",
    handoff: "Purchasing → Legal review where required",
  },
  {
    service: "Contract review",
    supports: "Terms, privacy and obligations",
    area: "legal",
    route: "Review coordination",
    system: "docuware",
    owner: "Jordan Lee",
    handoff: "Service owner → Legal → controlled record",
  },
  {
    service: "Office access or badge",
    supports: "Workplace readiness",
    area: "workplace",
    route: "Facilities request",
    system: "m365",
    owner: "Alex Morgan",
    handoff: "Hiring handover → Workplace",
  },
  {
    service: "Project support",
    supports: "Intake, business cases and delivery methods",
    area: "projects",
    route: "Project intake",
    system: "m365",
    owner: "Alex Morgan",
    handoff: "Projects → Technology → Purchasing as needed",
  },
  {
    service: "Start recruitment",
    supports: "Vacancy and selection workflow",
    area: "hiring",
    route: "Recruitment intake",
    system: "recruitment",
    owner: "Jordan Lee",
    handoff: "Hiring → approved setup handover to Technology & Workplace",
  },
];
export const handoffs = [
  {
    id: "SERV-104",
    name: "New software implementation",
    path: "Projects → Technology → Purchasing → Legal review",
    status: "Supplier review",
    next: "Purchasing & Suppliers",
    summary:
      "Blue Cedar Technologies is a fictional supplier example. Teams link to the same guidance at each step; purchasing and controlled records remain in their business systems.",
    steps: [
      {
        area: "projects",
        text: "Intake and business case",
        file: "business-case",
      },
      {
        area: "technology",
        text: "Technical requirements and approval",
        file: "software-approval",
      },
      {
        area: "procurement",
        text: "Sourcing and supplier setup",
        file: "supplier-onboarding",
      },
      {
        area: "legal",
        text: "Contract and privacy review",
        file: "contract-review",
      },
      { area: "resources", text: "Final service handover", file: "handover" },
    ],
    refs: [
      { system: "jira", id: "JSM-2481" },
      { system: "business-central", id: "PO-1047" },
      { system: "docuware", id: "DW-883" },
    ],
  },
  {
    id: "SERV-118",
    name: "New starter — Operations Analyst",
    path: "Hiring → Technology → Workplace",
    status: "Setup pending",
    next: "Technology Services",
    summary:
      "After the selection decision, only the approved role, start date and setup requirements move to the receiving service teams. Candidate assessments and references remain in the protected hiring matter and Recruitment Portal.",
    steps: [
      {
        area: "hiring",
        text: "Vacancy and selection; approved offer handover",
        file: "offer-handover",
      },
      {
        area: "technology",
        text: "Account and device readiness after selection",
        file: "account-access",
      },
      {
        area: "workplace",
        text: "Badge and workplace readiness",
        file: "office-access",
      },
    ],
    refs: [
      { system: "recruitment", id: "REC-221" },
      { system: "jira", id: "JSM-2490" },
    ],
  },
  {
    id: "SERV-123",
    name: "Office meeting-room upgrade",
    path: "Workplace → Technology → Purchasing",
    status: "Purchase approved",
    next: "Workplace & Travel",
    summary:
      "Northbridge Office Solutions is a fictional supplier reference. Coordinate room readiness without duplicating purchase transactions.",
    steps: [
      { area: "workplace", text: "Room requirements", file: "meeting-room" },
      {
        area: "technology",
        text: "Application and device standards",
        file: "app-register",
      },
      { area: "procurement", text: "Purchase route", file: "purchase-guide" },
    ],
    refs: [{ system: "business-central", id: "PO-1051" }],
  },
  {
    id: "SERV-129",
    name: "Process improvement — Travel requests",
    path: "Projects & Improvement → Workplace",
    status: "In review",
    next: "Projects & Improvement",
    summary:
      "Review the handoff between request guidance and travel coordination.",
    steps: [
      {
        area: "projects",
        text: "Map the service process",
        file: "process-mapping",
      },
      {
        area: "workplace",
        text: "Review current travel guidance",
        file: "travel-booking",
      },
    ],
    refs: [],
  },
  {
    id: "SERV-133",
    name: "Contractor onboarding",
    path: "Purchasing → Legal → Technology",
    status: "Handover needed",
    next: "Legal, Risk & Compliance",
    summary:
      "Confirm supplier assurance and obligations before requesting only the necessary system access.",
    steps: [
      {
        area: "procurement",
        text: "Supplier onboarding",
        file: "supplier-onboarding",
      },
      { area: "legal", text: "Review obligations", file: "contract-review" },
      {
        area: "technology",
        text: "Approved access requirements",
        file: "account-access",
      },
    ],
    refs: [{ system: "docuware", id: "DW-891" }],
  },
];
export const priorities = [
  "Laptop replacement cycle",
  "Supplier framework renewals",
  "Recruitment for three open roles",
  "Office access review",
  "Quarterly service improvement review",
];
export const recentIds = [
  "supplier-onboarding",
  "project-closure",
  "travel-booking",
  "interview-panel",
  "software-approval",
];
export const savedViews = [
  "All Documents",
  "Current Service Work",
  "Shared Guidance",
  "Templates",
  "Items Requiring Handover",
  "By Service Area",
  "Recently Updated",
];
export function queryDocuments(
  area: string,
  folder: string,
  view: string,
  search: string,
  workType = "",
) {
  const source =
    area === "resources"
      ? documents.filter((d) => d.area === "resources")
      : documents.filter(
          (d) => d.area === area || sharedReferences[area]?.includes(d.id),
        );
  return source
    .filter(
      (d) =>
        (!folder ||
          d.folder === folder ||
          (area === "legal" &&
            folder === "Risk & Assurance" &&
            d.id === "risk-assessment")) &&
        (!workType || d.workType === workType) &&
        (!search ||
          `${d.name} ${d.owner} ${d.campaign}`
            .toLowerCase()
            .includes(search.toLowerCase())) &&
        (view !== "Templates" || d.workType === "Template") &&
        (view !== "Shared Guidance" ||
          ["Guidance", "Service procedure"].includes(d.workType)) &&
        (view !== "Items Requiring Handover" || d.workType === "Handover") &&
        (view !== "Current Service Work" ||
          ["Checklist", "Handover", "Register"].includes(d.workType)),
    )
    .sort((a, b) =>
      view === "Recently Updated"
        ? b.modified.localeCompare(a.modified)
        : view === "By Service Area"
          ? a.campaign.localeCompare(b.campaign) || a.name.localeCompare(b.name)
          : a.name.localeCompare(b.name),
    );
}
