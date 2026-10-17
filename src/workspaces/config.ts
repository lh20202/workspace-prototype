import { workingFileSensitivity } from "../sharepoint/sensitivity";
import { externalEnvironmentForTool } from "../environments/catalog";
import { workspaceById } from "./registry";
import { enrichFunctionalFiles } from "./contentRealism";
import { employmentProtectedSubjects } from "./employmentSubjects";
import { welfareConfig, welfareFilesForPerson } from "./welfare";
import { migratedPublishingFiles } from "./publishing";
import type { FunctionalConfig, WorkingFile } from "./types";
// Explicit IDs preserve established links when a fixture moves to another owner.
// The seed itself belongs only to its current business workspace.
const seeds = {
  services: {
    areas: [
      [
        "office",
        "Office Maintenance & Equipment",
        "Repairs, meeting rooms, furniture, equipment and office moves.",
        "maintainx",
      ],
      [
        "purchasing",
        "Purchasing & Suppliers",
        "Sourcing, supplier evaluation, renewals and contract handoffs.",
        "coupa",
      ],
      [
        "travel",
        "Travel Services",
        "Booking coordination, group travel, changes and provider issues.",
        "travelperk",
      ],
      [
        "reception",
        "Reception",
        "Arrivals, deliveries, front-desk rota, rooms and office notices.",
        "envoy",
      ],
    ],
    items: [
      [
        "office",
        "Projector replacement",
        "Order replacement after facilities review",
      ],
      ["office", "Meeting room ventilation issue", "Confirm maintenance visit"],
      ["office", "Desk equipment request", "Check stock and delivery slot"],
      [
        "office",
        "Printer maintenance",
        "Confirm facilities supplier appointment",
      ],
      ["office", "Office move setup", "Confirm furniture and room readiness"],
      [
        "purchasing",
        "Supplier sourcing review",
        "Complete evaluation and route contract advice",
      ],
      [
        "purchasing",
        "Supplier onboarding",
        "Confirm supplier evidence; send payment handoff",
      ],
      [
        "purchasing",
        "Renewal planning",
        "Review supplier performance before renewal",
      ],
      [
        "travel",
        "Conference group travel",
        "Confirm itinerary and booking changes",
      ],
      [
        "travel",
        "Travel provider issue",
        "Follow up revised booking with provider",
      ],
      [
        "reception",
        "Upcoming arrivals and deliveries",
        "Confirm arrival slots and front-desk cover",
      ],
      [
        "reception",
        "Summer Picnic catering booking",
        "Confirm rooms, catering and physical setup",
      ],
    ],
    files: [
      ["office", "Office Move — Setup Checklist.docx"],
      ["office", "Equipment Replacement Review.xlsx"],
      ["purchasing", "Supplier Onboarding Checklist.docx"],
      ["purchasing", "Supplier Evaluation.xlsx"],
      ["travel", "Group Travel Coordination.xlsx"],
      ["travel", "Booking Change Checklist.docx"],
      ["reception", "Visitor Arrival Schedule.xlsx"],
      ["reception", "Front-Desk Rota.xlsx"],
    ],
    protected: [
      ["live-tender", "Live Tender Evaluation", "purchasing", false],
      ["negotiation", "Commercial Negotiation", "purchasing", false],
      [
        "visitor-arrangements",
        "Sensitive Visitor Arrangements",
        "office",
        false,
      ],
    ],
    tools: [
      ["maintainx", "MaintainX", "Facilities requests"],
      ["coupa", "Coupa", "Purchasing transactions"],
      ["travelperk", "TravelPerk", "Travel bookings"],
      ["envoy", "Envoy", "Visitor coordination"],
    ],
  },
  quality: {
    areas: [
      [
        "monitoring",
        "Quality & Monitoring",
        "Quality reviews, recurring issues, corrective actions and cross-company follow-up.",
        "safetyculture",
      ],
      [
        "process",
        "Process Management",
        "Discover, map and redesign handoffs, bottlenecks, control points and responsibilities.",
        "lucidchart",
      ],
      [
        "improvement",
        "Improvement Initiatives",
        "Cross-functional improvement intake, prioritisation and follow-through.",
      ],
      [
        "eco",
        "Eco Practice",
        "Lower-impact travel, office energy, waste reduction and responsible purchasing.",
        "plana",
      ],
      [
        "reviews",
        "Reviews & Actions",
        "Review findings, owners and improvement actions.",
      ],
    ],
    items: [
      [
        "monitoring",
        "Recurring handover delays",
        "Review impact across three operating processes",
      ],
      [
        "monitoring",
        "Quarterly quality review",
        "Agree corrective actions with functional owners",
      ],
      [
        "process",
        "Purchase-to-Pay Process Review",
        "Map sourcing, legal review and payment handoff",
      ],
      [
        "process",
        "New Starter Handover Redesign",
        "Confirm People, office and technical dependencies",
      ],
      [
        "process",
        "Travel Request Simplification",
        "Review approval bottleneck",
      ],
      [
        "process",
        "Service Handoff Process Review",
        "Agree process ownership and review checkpoints",
      ],
      [
        "process",
        "Customer Complaint Escalation Review",
        "Link customer-owned quality findings to process changes",
      ],
      [
        "improvement",
        "Service Request Redesign",
        "Prioritise common intake improvements",
      ],
      [
        "improvement",
        "Digital Adoption Improvement",
        "Review adoption friction with platform owners",
      ],
      [
        "improvement",
        "Supplier Onboarding Redesign",
        "Test revised cross-functional handoff",
      ],
      [
        "eco",
        "Low-Impact Travel Pilot",
        "Review travel options and participation feedback",
      ],
      [
        "eco",
        "Office Energy Reduction Review",
        "Assess facilities improvement options",
      ],
      [
        "eco",
        "Reusable Equipment Programme",
        "Coordinate reuse with office equipment owner",
      ],
      [
        "eco",
        "Supplier Eco Criteria Review",
        "Agree environmental criteria with purchasing",
      ],
      [
        "eco",
        "Annual Environmental Footprint Review",
        "Review measurement assumptions",
      ],
      [
        "reviews",
        "Corrective action follow-up",
        "Confirm owner evidence and next review",
      ],
    ],
    files: [
      ["monitoring", "Quality Review — Findings & Actions.xlsx"],
      ["process", "Purchase-to-Pay — Process Map.pptx"],
      ["process", "New Starter — Handoff Review.docx"],
      ["improvement", "Improvement Intake & Priorities.xlsx"],
      ["eco", "Low-Impact Travel Pilot — Review.xlsx"],
      ["eco", "Supplier Eco Criteria — Working Review.docx"],
      ["reviews", "Corrective Actions Log.xlsx"],
    ],
    protected: [],
    tools: [
      ["safetyculture", "SafetyCulture", "Quality checks and review activity"],
      ["lucidchart", "Lucidchart", "Working process maps"],
      ["plana", "Plan A", "Environmental measurement"],
    ],
  },
  digital: {
    areas: [
      [
        "engineering",
        "Engineering",
        "Code review, technical backlog, integration testing and release readiness.",
        "github",
      ],
      [
        "web-crm",
        "Web & CRM",
        "Website platforms, CRM schemas, APIs, webhooks, technical releases and observability.",
        "github",
      ],
      [
        "systems-engineering",
        "Business Systems",
        "Technical configuration, integrations, authentication and releases for customer, People and finance platforms.",
        "salesforce",
      ],
      [
        "ai-automation",
        "AI & Automation",
        "Local inference, chatbots, evaluation, RAG and integration automation.",
        "github",
      ],
      [
        "m365",
        "Microsoft 365 Engineering",
        "SharePoint, SPFx, Graph, tenant changes, provisioning, Teams and search engineering.",
        "m365",
      ],
      [
        "information-architecture",
        "Information Architecture",
        "Digital environment design: sites, libraries, metadata, navigation, access and migration implementation.",
        "m365",
      ],
      [
        "architecture",
        "Architecture & Governance",
        "Technical strategy, decision records, API standards, platform roadmaps and proof-of-concept review.",
      ],
      [
        "operations",
        "Service & Platform Operations",
        "Service desk, devices, account setup, operational changes and platform reliability.",
        "freshservice",
      ],
      [
        "protected",
        "Protected Technology",
        "Security and production subjects require specific technical authorisation.",
      ],
    ],
    items: [
      [
        "engineering",
        "Company Data API",
        "Review interface contract and test ownership",
      ],
      [
        "web-crm",
        "External Website Platform Upgrade",
        "Review deployment readiness in Company Git",
      ],
      [
        "web-crm",
        "Customer Platform Integration Refresh",
        "Triage CRM webhook issue and synchronisation tests",
      ],
      [
        "systems-engineering",
        "People Platform Integration",
        "Review technical API change; employment records remain in Employment & Hiring Administration",
      ],
      [
        "ai-automation",
        "New Customer Chatbot",
        "Compare retrieval evaluation fixtures and content acceptance handoff",
      ],
      [
        "ai-automation",
        "Local AI Classification Service",
        "Review schema-constrained extraction benchmark",
      ],
      [
        "m365",
        "M365 Search Improvements",
        "Review search implementation and SPFx component backlog",
      ],
      [
        "m365",
        "Automated Access Workflow",
        "Review provisioning script and authorised access design",
      ],
      [
        "information-architecture",
        "Workspace Metadata Deployment",
        "Map taxonomy implementation to business and archive requirements",
      ],
      [
        "architecture",
        "Technical roadmap review",
        "Record platform trade-offs and next architecture decision",
      ],
      [
        "operations",
        "New starter account and device setup",
        "Confirm authorised request and platform readiness",
      ],
    ],
    files: [
      ["engineering", "Company Data API — API Contract.yaml"],
      ["web-crm", "Release Plan.xlsx"],
      ["web-crm", "Integration Architecture.pptx"],
      ["web-crm", "Deployment Checklist.docx"],
      ["web-crm", "Environment Matrix.xlsx"],
      ["web-crm", "Technical Debt Register.xlsx"],
      ["web-crm", "Incident Review.docx"],
      ["systems-engineering", "People Platform — Integration Design.docx"],
      ["ai-automation", "Model Evaluation.xlsx"],
      ["ai-automation", "Inference Benchmark.md"],
      ["ai-automation", "Prompt Test Set.json"],
      ["ai-automation", "RAG Evaluation.xlsx"],
      ["ai-automation", "Automation Flow Design.pptx"],
      ["m365", "SPFx Component Backlog.xlsx"],
      ["m365", "Search Architecture.pptx"],
      ["m365", "Tenant Change Plan.docx"],
      ["m365", "Provisioning Script Review.docx"],
      ["m365", "Graph Integration Notes.docx"],
      ["information-architecture", "Metadata Deployment Design.docx"],
      ["architecture", "Architecture Decision Record.docx"],
      ["operations", "Service Change — Handoff Checklist.docx"],
    ],
    protected: [
      ["security", "Security Engineering", "protected", true],
      ["privileged-access", "Privileged Access", "protected", true],
      ["credentials", "Production Credentials", "protected", true],
      ["vulnerabilities", "Security Vulnerabilities", "protected", true],
      [
        "production",
        "Production Environment Administration",
        "protected",
        true,
      ],
      [
        "restricted-web",
        "Restricted Web Platform Engineering",
        "protected",
        true,
      ],
      ["recovery", "Critical Platform Recovery", "protected", true],
    ],
    tools: [
      ["freshservice", "Freshservice", "Service desk"],
      ["github", "GitHub Enterprise", "Fictional Company Git"],
      ["m365", "Microsoft 365", "Tenant and platform engineering"],
      ["datadog", "Datadog", "Technical observability"],
      ["contentful", "Contentful", "CMS technical platform"],
      ["salesforce", "Salesforce Platform", "CRM technical configuration"],
      ["huggingface", "Hugging Face", "Model and licence review references"],
    ],
  },
  legal: {
    areas: [
      [
        "review",
        "Legal Review",
        "Legal advice coordination and review intake.",
      ],
      [
        "privacy",
        "Privacy Assessments",
        "Assess proposed processing and agree review actions.",
      ],
      [
        "compliance",
        "Compliance Reviews",
        "Track obligations, evidence requests and review decisions.",
      ],
      [
        "risk",
        "Risk & Assurance",
        "Organisational risk methods, assurance and escalation.",
      ],
      [
        "contracts",
        "Contract Review",
        "Coordinate authorised contract advice with supplier and business owners.",
      ],
      [
        "audit",
        "Audit Coordination",
        "Coordinate evidence requests with authoritative functional owners.",
      ],
      [
        "policy",
        "Policy Change",
        "Review proposed policy changes and approved outcomes.",
      ],
    ],
    items: [
      [
        "review",
        "Legal review intake",
        "Confirm scope with the authorised business owner",
      ],
      [
        "privacy",
        "Customer platform privacy assessment",
        "Review proposed processing with technical and care owners",
      ],
      ["compliance", "Compliance review cycle", "Assign evidence owners"],
      [
        "risk",
        "Risk methodology review",
        "Review cross-functional control responsibilities",
      ],
      [
        "contracts",
        "Supplier contract review",
        "Return advice reference to purchasing",
      ],
      [
        "audit",
        "Audit evidence coordination",
        "Link functional evidence without copying case records",
      ],
      [
        "policy",
        "Policy change review",
        "Confirm approval and publication handoff",
      ],
    ],
    files: [
      ["review", "Legal Review — Intake Checklist.docx"],
      ["privacy", "Privacy Assessment — Working Questions.docx"],
      ["compliance", "Compliance Review Schedule.xlsx"],
      ["risk", "Assurance Actions.xlsx"],
      ["contracts", "Contract Review — Handoff Checklist.docx"],
      ["audit", "Audit Coordination Schedule.xlsx"],
      ["policy", "Policy Change — Review Log.docx"],
    ],
    protected: [
      ["privileged", "Privileged Legal Advice", "review", true],
      ["disputes", "Disputes & Claims", "review", true],
      ["privacy-incidents", "Privacy Incidents", "privacy", true],
      ["investigations", "Investigations", "risk", true],
      ["formal-cases", "Formal Cases", "review", true],
      ["sensitive-risk", "Sensitive Risk Reviews", "risk", true],
    ],
    tools: [],
  },
  people: {
    areas: [
      [
        "workforce",
        "Workforce & Organisation",
        "Workforce planning, organisation design and organisation-wide people programmes.",
      ],
      [
        "culture",
        "Leadership, Culture & Inclusion",
        "Leadership, inclusive working practices and culture development.",
      ],
      [
        "learning",
        "Capability & Learning",
        "Learning design, capability reviews and onboarding development.",
      ],
      [
        "frameworks",
        "Reward & Employment Frameworks",
        "Organisation-wide reward principles and employment-framework design; individual administration belongs to Employment & Hiring Administration.",
      ],
      [
        "communications",
        "Internal Communications",
        "All-staff meetings, intranet and wiki publishing, editorial planning and follow-up.",
        "staffbase",
      ],
      [
        "communities",
        "Staff Communities & Company Events",
        "Opt-in networks, open events, programme planning and staff experience.",
      ],
      [
        "analytics",
        "People Analytics",
        "Aggregate workforce questions and interpretation without individual records.",
      ],
      [
        "wellbeing",
        "Wellbeing Programmes",
        "Open wellbeing events and programme communications; confidential support and duty-of-care follow-up belong to Welfare & Employee Representation.",
      ],
    ],
    items: [
      [
        "workforce",
        "Workforce planning coordination",
        "Review role needs with department contributors",
        "PEOPLE-101",
      ],
      [
        "culture",
        "Inclusive leadership programme",
        "Review programme design and participation methods",
        "PEOPLE-102",
      ],
      [
        "learning",
        "Manager capability pilot",
        "Review aggregate pilot feedback and next learning cycle",
        "PEOPLE-105",
      ],
      [
        "learning",
        "New starter onboarding",
        "Coordinate learning and induction after authorised hiring handoff",
        "PEOPLE-106",
      ],
      [
        "communications",
        "Company All-Staff Meeting",
        "Prepare agenda, speakers, slides, Q&A, run of show and publication",
        "PEOPLE-108",
      ],
      [
        "communications",
        "Intranet & Wiki Publishing",
        "Review page ownership, editorial queue and staff update",
        "PEOPLE-109",
      ],
      [
        "communities",
        "Annual Summer Picnic",
        "Agree programme, participation and staff communications",
        "PEOPLE-110",
      ],
      [
        "communities",
        "Annual Winter Social",
        "Review programme and community experience",
        "PEOPLE-111",
      ],
      [
        "communities",
        "Company volunteering day",
        "Coordinate open participation and event communications",
        "PEOPLE-112",
      ],
      [
        "analytics",
        "Aggregate workforce analysis",
        "Review synthetic aggregate questions with authorised analysts",
        "PEOPLE-113",
      ],
      [
        "wellbeing",
        "Wellbeing events programme",
        "Coordinate open wellbeing events and programme communications",
        "PEOPLE-114",
      ],
      [
        "frameworks",
        "Reward framework consultation",
        "Review organisation-wide principles and aggregate consultation themes",
        "PEOPLE-115",
      ],
    ],
    files: [
      [
        "workforce",
        "Workforce Planning — Contribution Schedule.xlsx",
        "people-F1",
      ],
      ["culture", "Leadership Programme — Design Review.docx", "people-F2"],
      [
        "learning",
        "Manager Capability Programme — Pilot Feedback.xlsx",
        "people-F5",
      ],
      ["learning", "Onboarding Learning Plan.docx", "people-F6"],
      [
        "communications",
        "Company All-Staff Meeting — Agenda.docx",
        "people-F8",
      ],
      ["communications", "All-Staff Speaker Coordination.xlsx", "people-F9"],
      ["communications", "All-Staff Slides — Working Deck.pptx", "people-F10"],
      ["communications", "All-Staff Questions & Follow-up.xlsx", "people-F11"],
      ["communications", "All-Staff Run of Show.docx", "people-F12"],
      [
        "communications",
        "Recording & Publication Checklist.docx",
        "people-F13",
      ],
      [
        "communications",
        "Intranet & Wiki — Publishing Calendar.xlsx",
        "people-F14",
      ],
      ["communities", "Summer Picnic — Programme.docx", "people-F15"],
      ["communities", "Winter Social — Participation Plan.docx", "people-F16"],
      ["analytics", "Aggregate People Questions.docx", "people-F17"],
      ["wellbeing", "Wellbeing Events — Planning.docx", "people-F18"],
      ["frameworks", "Reward Framework — Design Principles.docx", "people-F19"],
      [
        "frameworks",
        "Employment Framework — Consultation Plan.xlsx",
        "people-F20",
      ],
    ],
    protected: [
      [
        "network-membership",
        "Staff Network Membership & Private Channels",
        "communities",
        true,
      ],
    ],
    tools: [["staffbase", "Staffbase", "Internal communications publishing"]],
  },
  employment: {
    areas: [
      [
        "hiring",
        "Recruitment Administration",
        "Vacancy setup, panel coordination, hiring-process preparation and controlled recruitment handoffs.",
        "greenhouse",
      ],
      [
        "employment",
        "Employment Operations",
        "Shared employment-change methods and authorised system handoffs.",
        "workday",
      ],
      [
        "inputs",
        "Payroll & Benefits Coordination",
        "Input-control procedures only; individual payroll and benefits inputs require specific authorisation.",
        "workday",
      ],
      [
        "protected",
        "Restricted Employment Information",
        "Separate authorisation for candidate subjects, individual employment records and cases.",
      ],
    ],
    items: [
      [
        "hiring",
        "Vacancy setup & panel readiness",
        "Confirm the approval route and shared panel timetable in Greenhouse",
      ],
      [
        "employment",
        "Employment-change handoff review",
        "Check the authorisation sequence and Workday process responsibilities",
      ],
      [
        "hiring",
        "Vacancy and interview planning",
        "Confirm role criteria and structured interview schedule",
        "PEOPLE-103",
      ],
      [
        "hiring",
        "Hiring-process improvement",
        "Review selection handoffs; candidate assessment stays protected",
        "PEOPLE-104",
      ],
      [
        "employment",
        "Employment change process review",
        "Review business process; individual changes remain protected",
        "PEOPLE-107",
      ],
    ],
    files: [
      ["hiring", "Vacancy Setup — Approval Checklist.docx"],
      ["hiring", "Recruitment Handoff — Responsibility Map.docx"],
      ["inputs", "Payroll Input — Control Checklist.docx"],
      ["inputs", "Benefits Input — Handoff Procedure.docx"],
      ["employment", "Leaver Process — System Handoff.docx"],
      ["hiring", "Role & Selection Criteria.docx", "people-F3"],
      ["hiring", "Interview Planning Schedule.xlsx", "people-F4"],
      [
        "employment",
        "Employment Process — Working Checklist.docx",
        "people-F7",
      ],
    ],
    protected: employmentProtectedSubjects,
    tools: [
      [
        "workday",
        "Workday HCM",
        "Authoritative employment and personnel records, employment changes, payroll and benefits inputs. Authorised users only; SharePoint contains shared coordination methods.",
      ],
      [
        "greenhouse",
        "Greenhouse Recruiting",
        "Authoritative candidate workflow; authorised users only",
      ],
    ],
  },
  customer: {
    areas: [
      [
        "care",
        "Customer Care",
        "Enquiry themes, service recovery and customer-care improvement.",
        "zendesk",
      ],
      [
        "relationships",
        "Relationship Management",
        "Relationship continuity, stewardship planning and shared methods.",
        "hubspot",
      ],
      [
        "premium",
        "Premium Customer Care",
        "Care planning and continuity without customer records.",
        "gainsight",
      ],
      [
        "accounts",
        "Key & B2B Account Management",
        "Account stewardship methods, meeting preparation and business relationship follow-up.",
        "hubspot",
      ],
      [
        "partnerships",
        "Institutional Partnerships",
        "Partnership planning, commitments and stakeholder relationships.",
        "quorum",
      ],
      [
        "stakeholders",
        "Stakeholder Relations",
        "Engagement planning and shared follow-up.",
      ],
      [
        "meetings",
        "Meetings & Negotiations",
        "Meeting preparation, negotiation coordination and agreed next steps.",
        "docusign",
      ],
      [
        "quality",
        "Service Quality & Coaching",
        "Interaction reviews, calibration, coaching, care standards and escalation improvement.",
      ],
    ],
    items: [
      [
        "care",
        "Customer Service Recovery Review",
        "Review recurring enquiry themes without personal case data",
      ],
      [
        "relationships",
        "Relationship continuity review",
        "Confirm stewardship handoff and next contact-planning review",
      ],
      [
        "premium",
        "Premium care continuity planning",
        "Review service approach with authorised relationship owners",
      ],
      [
        "accounts",
        "Key account stewardship planning",
        "Prepare account meeting method and follow-up",
      ],
      [
        "partnerships",
        "Institutional partnership review",
        "Confirm commitments and next review",
      ],
      [
        "stakeholders",
        "Stakeholder engagement planning",
        "Review priorities and follow-up owners",
      ],
      [
        "meetings",
        "Partnership meeting preparation",
        "Confirm agenda and authorised agreement reference",
      ],
      [
        "quality",
        "Monthly Interaction Quality Review",
        "Agree coaching actions from aggregate observations",
      ],
      [
        "quality",
        "Complaint Handling Calibration",
        "Compare fictional low-detail scenarios and improve escalation",
      ],
      [
        "quality",
        "Call Quality Calibration",
        "Agree interaction standards and coaching approach",
      ],
      [
        "quality",
        "Frontline Coaching Cycle",
        "Coordinate coaching review and service consistency",
      ],
      [
        "quality",
        "Customer Care Process Improvement",
        "Refer systemic handoff issue to Quality process review",
      ],
    ],
    files: [
      ["care", "Recurring Enquiry Themes.xlsx"],
      ["relationships", "Relationship Continuity — Working Plan.docx"],
      ["premium", "Premium Care — Service Approach.docx"],
      ["accounts", "Account Meeting — Preparation Checklist.docx"],
      ["partnerships", "Partnership Review — Working Agenda.docx"],
      ["stakeholders", "Stakeholder Engagement — Coordination.docx"],
      ["meetings", "Negotiation Preparation — Checklist.docx"],
      ["quality", "Monthly Interaction Quality — Review.xlsx"],
      ["quality", "Complaint Handling — Calibration Notes.docx"],
      ["quality", "Frontline Coaching — Review Plan.docx"],
    ],
    protected: [
      ["platinum", "Platinum Customer Stewardship", "premium", true],
      ["customer-cases", "Individual Customer Cases", "care", false],
      ["commercial-account", "Sensitive Account Negotiation", "accounts", true],
    ],
    tools: [
      ["zendesk", "Zendesk", "Authoritative care cases"],
      ["hubspot", "HubSpot CRM", "Authoritative relationship records"],
      ["gainsight", "Gainsight", "Customer-success context"],
      ["quorum", "Quorum", "Stakeholder relationship context"],
      ["docusign", "DocuSign", "Authoritative agreement signatures"],
    ],
  },
  archives: {
    areas: [
      [
        "collections",
        "Collections",
        "Browse historical collections and record series.",
      ],
      [
        "legacy-drive",
        "Legacy P: drive",
        "View-only legacy folders and historical material.",
      ],
      ["global", "Global Archives", "Distinct branch archive catalogues."],
      [
        "retention",
        "Records & Retention",
        "Retention schedules, triggers, appraisal and final actions.",
      ],
      [
        "transfer",
        "Appraisal & Transfer",
        "Owner review, transfer approval, description and preservation.",
      ],
      [
        "cataloguing",
        "Description & Cataloguing",
        "Record series, creator context and catalogue description.",
        "archivesspace",
      ],
      [
        "preservation",
        "Digital Preservation",
        "Format risk, checksums, preservation copies, digitisation and media care.",
        "preservica",
      ],
      ["access", "Access Requests", "Coordinate archive access decisions."],
      [
        "projects",
        "Archive Projects",
        "Collection description and preservation improvement work.",
      ],
    ],
    items: [
      [
        "retention",
        "Retention Schedule Review",
        "Review record-series triggers and final action",
      ],
      [
        "transfer",
        "2022 Executive Papers",
        "Confirm owner review before controlled transfer",
      ],
      [
        "transfer",
        "Legacy Marketing Campaign Records",
        "Appraise historical value and describe record series",
      ],
      [
        "transfer",
        "Completed System Migration Records",
        "Review business evidence for archive transfer",
      ],
      [
        "transfer",
        "Historical Annual Reports",
        "Confirm preservation and catalogue completeness",
      ],
      [
        "transfer",
        "Closed Project Documentation",
        "Confirm retention and appraisal decision",
      ],
      [
        "cataloguing",
        "Historical Collection Description",
        "Review creator context and series description",
      ],
      [
        "preservation",
        "Audio-visual Preservation Review",
        "Review format risk, checksums and preservation copies",
      ],
      [
        "access",
        "Archive access requests",
        "Confirm authorised access decision",
      ],
      [
        "projects",
        "Institutional Memory Collection",
        "Plan description and digitisation priorities",
      ],
    ],
    files: [
      ["retention", "Retention Schedule — Review Notes.docx"],
      ["transfer", "Archive Transfer — Appraisal Worksheet.xlsx"],
      ["cataloguing", "Collection Description — Working Notes.docx"],
      ["preservation", "Format Risk & Preservation Review.xlsx"],
      ["projects", "Institutional Memory — Description Plan.docx"],
    ],
    protected: [
      ["historical", "Restricted Historical Collection", "collections", false],
    ],
    tools: [
      ["archivesspace", "ArchivesSpace", "Catalogue and description"],
      ["preservica", "Preservica", "Digital preservation"],
    ],
  },
};
export const functionalConfigs: FunctionalConfig[] = Object.entries(seeds).map(
  ([id, s]) => ({
    id,
    areas: s.areas.map(([id, name, summary, tool]) => ({
      id,
      name,
      summary,
      tool,
    })),
    items: s.items.map(([area, name, nextAction, stableId], i) => ({
      id: stableId || `${id.toUpperCase()}-${101 + i}`,
      area,
      name,
      nextAction,
      owner:
        id === "employment"
          ? "Employment Operations"
          : id === "people"
            ? "Elena Rossi"
            : id === "digital"
              ? "Casey Blake"
              : id === "customer"
                ? "Maya Chen"
                : "Jordan Lee",
      status:
        i % 3 === 0
          ? "Needs review"
          : i % 3 === 1
            ? "In progress"
            : "Awaiting input",
      due: `2026-10-${20 + (i % 10)}`,
      kind:
        area === "eco"
          ? "Eco improvement"
          : area === "quality"
            ? "Interaction quality"
            : "Working review",
    })),
    files: enrichFunctionalFiles(
      id,
      s.files.map(
        ([area, name, stableId], i) =>
          ({
            id: stableId || `${id}-F${i + 1}`,
            area,
            name,
            folder: area,
            workType: "Working review",
            reference: "",
            library: "operations",
            campaign: workspaceById.get(id)!.title,
            operation: "Shared operations",
            location: workspaceById.get(id)!.title,
            type: name.split(".").at(-1)!,
            status: "Current",
            owner: id === "people" ? "Elena Rossi" : "Jordan Lee",
            validFrom: "2026-10-01",
            validTo: "2026-12-31",
            modified: "2026-10-16",
            sensitivity: workingFileSensitivity(id, area, name),
            recordState: "Working information",
          }) as WorkingFile,
      ),
    ),
    protected: s.protected.map(([id, name, area, strict]) => ({
      id: String(id),
      name: String(name),
      area: String(area),
      strict: Boolean(strict),
    })),
    tools: s.tools.map(([id, name, purpose]) => ({
      id,
      name: externalEnvironmentForTool(id)?.name || name,
      purpose,
    })),
  }),
);
functionalConfigs.push(welfareConfig);
functionalConfigs
  .find((config) => config.id === "digital")!
  .files.push(...migratedPublishingFiles);
export const configById = new Map(functionalConfigs.map((c) => [c.id, c]));
export const filesForWorkspace = (id: string, personId?: string) =>
  id === "welfare"
    ? welfareFilesForPerson(personId || "")
    : configById.get(id)?.files || [];
