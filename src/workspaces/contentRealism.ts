import type { WorkingFile } from "./types";
import { functionalLibraries } from "./siteArchitecture";
import { workspaceById } from "./registry";

type AddedFile = [area: string, name: string, folder?: string];
const additions: Record<string, AddedFile[]> = {
  services: [
    ["office", "Office Readiness — Room Checks.xlsx"],
    ["office", "Equipment Replacement — Requirements.docx"],
    ["office", "Maintenance Visit — Coordination Notes.docx"],
    ["purchasing", "Workplace Equipment — Sourcing Brief.docx"],
    ["purchasing", "Workplace Equipment — Supplier Shortlist.xlsx"],
    ["purchasing", "Workplace Equipment — Commercial Comparison.xlsx"],
    ["purchasing", "Workplace Equipment — Decision Summary.docx"],
    ["purchasing", "Office Services — Renewal Review.xlsx"],
    ["purchasing", "Office Services — Performance Summary.docx"],
    ["purchasing", "Office Services — Renewal Decision.docx"],
    ["travel", "October Group Travel — Booking Requirements.docx"],
    ["travel", "October Group Travel — Provider Comparison.xlsx"],
    ["travel", "October Group Travel — Readiness Checklist.docx"],
    ["reception", "Visitor Welcome — Room Requirements.docx"],
    ["reception", "Visitor Coordination — Booking Checklist.docx"],
    ["reception", "Reception — Opening & Closing Checklist.docx"],
    ["reception", "Reception — Delivery Handoff.docx"],
  ],
  quality: [
    ["monitoring", "October Quality Review — Evidence Summary.docx"],
    ["monitoring", "October Quality Review — Sampling Method.docx"],
    ["monitoring", "October Quality Review — Discussion Deck.pptx"],
    ["monitoring", "October Quality Review — Follow-up Notes.docx"],
    ["process", "Purchase-to-Pay — Discovery Notes.docx"],
    ["process", "Purchase-to-Pay — Handoff Measures.xlsx"],
    ["process", "New Starter — Future Process.pptx"],
    ["process", "New Starter — Pilot Measures.xlsx"],
    ["improvement", "Service Request Improvement — Brief.docx"],
    ["improvement", "Service Request Improvement — Trial Plan.xlsx"],
    ["improvement", "Service Request Improvement — Review Notes.docx"],
    ["eco", "Low-Impact Travel Pilot — Options.docx"],
    ["eco", "Low-Impact Travel Pilot — Findings.pptx"],
    ["eco", "Supplier Eco Criteria — Consultation Notes.docx"],
    ["reviews", "Corrective Actions — Review Agenda.docx"],
  ],
  digital: [
    ["engineering", "Company Data API — Consumer Test Plan.xlsx"],
    ["engineering", "Company Data API — Error Semantics.docx"],
    ["engineering", "Company Data API — Contract Review Notes.docx"],
    ["web-crm", "Web & CRM — Interface Mapping.xlsx"],
    ["web-crm", "Web & CRM — Design Review Notes.docx"],
    ["web-crm", "Release Acceptance — Evidence Summary.docx"],
    ["web-crm", "Integration Review — Follow-up Actions.xlsx"],
    ["ai-automation", "Automation — Retrieval Design.docx"],
    ["ai-automation", "Automation — Integration Boundaries.docx"],
    ["information-architecture", "Workspace Metadata — Column Mapping.xlsx"],
    ["information-architecture", "Workspace Metadata — Validation Plan.docx"],
    [
      "information-architecture",
      "Workspace Metadata — Migration Checklist.docx",
    ],
    ["architecture", "API Standards — Decision Options.docx"],
    ["architecture", "Platform Roadmap — Review Deck.pptx"],
    ["architecture", "Architecture Review — Follow-up.xlsx"],
    ["operations", "Service Change — Readiness Review.docx"],
    ["operations", "Service Change — Rollback Exercise.xlsx"],
    ["operations", "Service Change — Communications Plan.docx"],
  ],
  legal: [
    ["review", "Advice Coordination — Business Context Template.docx"],
    ["review", "Advice Coordination — Review Routing.docx"],
    ["compliance", "Quarterly Compliance — Evidence Request Template.docx"],
    ["compliance", "Quarterly Compliance — Review Agenda.docx"],
    ["compliance", "Quarterly Compliance — Obligation Mapping.xlsx"],
    ["privacy", "Processing Assessment — Scoping Guide.docx"],
    ["privacy", "Processing Assessment — Review Method.docx"],
    ["risk", "Assurance Review — Evidence Guidance.docx"],
    ["contracts", "Supplier Agreement — Business Review Questions.docx"],
    ["contracts", "Supplier Agreement — Approval Route.docx"],
    ["audit", "Audit Coordination — Evidence Owner Guide.docx"],
    ["policy", "Policy Review — Consultation Plan.xlsx"],
    ["policy", "Policy Review — Publication Checklist.docx"],
  ],
  people: [
    ["workforce", "Workforce Planning — Role Needs Template.docx"],
    ["workforce", "Workforce Planning — Contribution Guidance.docx"],
    ["culture", "Leadership Programme — Facilitation Outline.docx"],
    ["culture", "Leadership Programme — Aggregate Feedback.xlsx"],
    ["hiring", "Selection Planning — Structured Interview Guide.docx"],
    ["hiring", "Selection Planning — Panel Preparation.docx"],
    ["hiring", "Selection Planning — Process Review.xlsx"],
    ["learning", "Manager Capability Programme — Learning Plan.docx"],
    ["learning", "Manager Capability Programme — Facilitation Notes.docx"],
    ["learning", "Onboarding Learning — Session Outline.docx"],
    ["learning", "Onboarding Learning — Programme Review.docx"],
    ["employment", "Employment Process — Handoff Guidance.docx"],
    ["communications", "Intranet & Wiki — Editorial Brief.docx"],
    ["communications", "Intranet & Wiki — Page Owner Review.xlsx"],
    ["analytics", "Workforce Analysis — Aggregate Measures.xlsx"],
    ["wellbeing", "Wellbeing Events — Communications Plan.docx"],
  ],
  customer: [
    ["care", "Care Review — Service Recovery Method.docx"],
    ["care", "Care Review — Enquiry Theme Definitions.docx"],
    ["care", "Care Review — Improvement Discussion.pptx"],
    ["premium", "Care Continuity — Service Handoff Checklist.docx"],
    ["relationships", "Relationship Continuity — Review Agenda.docx"],
    ["relationships", "Relationship Continuity — Shared Measures.xlsx"],
    ["relationships", "Relationship Continuity — Handoff Guide.docx"],
    ["accounts", "Account Meeting — Business Brief Template.docx"],
    ["accounts", "Account Meeting — Follow-up Method.xlsx"],
    ["partnerships", "Partnership Review — Preparation Guide.docx"],
    ["stakeholders", "Stakeholder Engagement — Planning Template.xlsx"],
    ["meetings", "Meeting Preparation — Business Brief.docx"],
    ["meetings", "Meeting Preparation — Options Worksheet.xlsx"],
    ["meetings", "Meeting Preparation — Agreed Action Template.docx"],
  ],
  archives: [
    ["retention", "Retention Review — Trigger Mapping.xlsx"],
    ["retention", "Retention Review — Consultation Log.docx"],
    ["transfer", "Archive Transfer — Preparation Checklist.docx"],
    ["transfer", "Archive Transfer — Series Description.xlsx"],
    ["transfer", "Archive Transfer — Owner Review Guidance.docx"],
    ["cataloguing", "Collection Description — Creator Context.docx"],
    ["cataloguing", "Collection Description — Description Checklist.xlsx"],
    ["preservation", "Preservation Review — Format Inventory.xlsx"],
    ["preservation", "Preservation Review — Treatment Options.docx"],
    ["projects", "Institutional Memory — Description Priorities.xlsx"],
  ],
};

const areaFolders: Record<string, Record<string, string>> = {
  services: {
    office: "Office Maintenance & Equipment/Service readiness",
    purchasing: "Supplier sourcing/Workplace equipment",
    travel: "Group travel/October 2026",
    reception: "Reception/Service readiness",
  },
  quality: {
    monitoring: "Quality reviews/October 2026",
    reviews: "Corrective actions/October review",
    process: "Process reviews/Purchase-to-Pay",
    improvement: "Service request improvement/Current trial",
    eco: "Eco pilots/Low-impact travel",
  },
  digital: {
    engineering: "API Design/Company Data API",
    "web-crm": "Web & CRM/Platform design",
    "systems-engineering": "Business Systems/Integration design",
    "ai-automation": "AI & Automation/Design",
    m365: "M365 & SPFx/Search rollout",
    "information-architecture": "Workspace Metadata/Implementation",
    architecture: "Decision records/Platform roadmap",
    operations: "Service changes/October readiness",
  },
  legal: {
    review: "Advice coordination/Shared methods",
    compliance: "Compliance reviews/Quarterly cycle",
    policy: "Policy changes/Review and publication",
    privacy: "Privacy assessments/Assessment methods",
    risk: "Assurance/Review methods",
    audit: "Audit coordination/Evidence preparation",
    contracts: "Supplier agreements/Business review",
  },
  people: {
    workforce: "Workforce planning/2027 contributions",
    culture: "Leadership programme/Pilot design",
    learning: "Learning programmes/Manager capability",
    frameworks: "Employment frameworks/Organisation-wide design",
    communications: "All-staff meetings/October 2026",
    communities: "Company events/Programme planning",
    analytics: "Workforce analysis/Aggregate methods",
    wellbeing: "Wellbeing programme/Open events",
  },
  employment: {
    hiring: "Vacancy coordination/Setup and panel preparation",
    employment: "Employment process/Authorised handoffs",
    inputs: "Input controls/System handoff methods",
  },
  customer: {
    care: "Care review/Service recovery",
    premium: "Care continuity/Shared methods",
    quality: "Interaction quality/October coaching",
    relationships: "Relationship continuity/Quarterly planning",
    accounts: "Account stewardship/Meeting preparation",
    partnerships: "Partnership reviews/Shared methods",
    stakeholders: "Stakeholder engagement/Planning methods",
    meetings: "Meeting preparation/Business discussions",
  },
  archives: {
    retention: "Retention review/Schedule consultation",
    transfer: "Archive transfer/Appraisal preparation",
    cataloguing: "Collection description/Working methods",
    preservation: "Preservation review/Format assessment",
    projects: "Institutional memory/Description planning",
  },
};
export function folderForFunctionalFile(
  id: string,
  area: string,
  name: string,
) {
  if (
    id === "services" &&
    area === "purchasing" &&
    name.startsWith("Office Services")
  )
    return "Supplier reviews/2026 renewals";
  if (id === "services" && area === "reception" && /Visitor|Arrival/.test(name))
    return "Visitor coordination/October 2026";
  if (id === "quality" && area === "process" && /New Starter/.test(name))
    return "Process reviews/New starter handoff";
  if (id === "quality" && area === "eco" && /Supplier/.test(name))
    return "Eco pilots/Supplier criteria";
  if (id === "digital" && area === "web-crm")
    return `Web & CRM/${/Release|Deployment/.test(name) ? "Release planning" : /Incident|Debt|Integration Review/.test(name) ? "Reviews" : "Platform design"}`;
  if (id === "digital" && area === "ai-automation")
    return `AI & Automation/${/Evaluation|Benchmark|Test/.test(name) ? "Evaluation" : "Design"}`;
  if (
    id === "people" &&
    area === "communications" &&
    name.startsWith("Intranet")
  )
    return "Intranet & Wiki/Publishing";
  if (id === "people" && area === "learning" && /Onboarding/.test(name))
    return "Learning programmes/New starter induction";
  return areaFolders[id]?.[area] || `${area}/Current work`;
}
function fileMetadata(id: string, file: WorkingFile): Record<string, string> {
  const folder = file.folderPath!.split("/");
  const reviewDate = file.status === "Current" ? "2027-01-15" : "2026-10-30";
  const base = { "Review date": reviewDate };
  switch (id) {
    case "services":
      return file.area === "purchasing"
        ? {
            ...base,
            Supplier: file.name.startsWith("Office Services")
              ? "Brightline Services"
              : "Northstar Workplace",
            Activity: /Decision/.test(file.name)
              ? "Decision"
              : /Onboarding/.test(file.name)
                ? "Onboarding"
                : /Office Services/.test(file.name)
                  ? "Renewal review"
                  : "Sourcing",
          }
        : file.area === "travel" || /Visitor/.test(file.folderPath!)
          ? {
              Activity:
                file.area === "travel"
                  ? "Group travel"
                  : "Visitor coordination",
              "Booking period": "October 2026",
              "Coordination date": "2026-10-23",
            }
          : {
              ...base,
              Activity:
                file.area === "office"
                  ? "Office readiness"
                  : "Front-desk cover",
              "Service owner": "Organisation Services",
            };
    case "quality":
      return file.area === "eco"
        ? {
            ...base,
            Initiative: folder[1],
            Activity: /Findings|Review/.test(file.name)
              ? "Pilot review"
              : "Preparation",
          }
        : ["process", "improvement"].includes(file.area)
          ? {
              ...base,
              Process:
                file.area === "improvement" ? "Service requests" : folder[1],
              Activity: /Review|Notes/.test(file.name) ? "Review" : "Design",
            }
          : {
              ...base,
              "Review cycle": "October 2026",
              Process: "Service handoffs",
            };
    case "digital":
      return file.area === "operations"
        ? {
            Service: "Shared platforms",
            Activity: "Service change",
            "Change window": "2026-10-28",
          }
        : ["architecture", "information-architecture"].includes(file.area)
          ? {
              ...base,
              Platform:
                file.area === "architecture"
                  ? "Shared platforms"
                  : "Microsoft 365",
              "Decision scope":
                file.area === "architecture"
                  ? "Platform roadmap"
                  : "Workspace configuration",
            }
          : {
              ...base,
              Platform: folder[0],
              Activity: /Release|Deployment|Acceptance/.test(file.name)
                ? "Release preparation"
                : /Evaluation|Benchmark|Test/.test(file.name)
                  ? "Evaluation"
                  : "Design",
              Release: "2026.10",
            };
    case "legal":
      return file.area === "contracts"
        ? {
            ...base,
            "Agreement type": "Supplier agreement",
            Activity: "Business review",
          }
        : ["privacy", "risk", "audit"].includes(file.area)
          ? {
              ...base,
              Assessment:
                file.area === "privacy"
                  ? "Processing assessment"
                  : "Assurance methods",
              "Review cycle": "Q4 2026",
            }
          : {
              ...base,
              "Work type":
                file.area === "policy"
                  ? "Policy"
                  : file.area === "compliance"
                    ? "Compliance"
                    : "Advice coordination",
              "Review cycle": "Q4 2026",
            };
    case "people":
      return file.area === "communications"
        ? {
            Channel: file.name.startsWith("Intranet")
              ? "Intranet & Wiki"
              : "All-staff meeting",
            "Publication date": "2026-10-29",
            Activity: /Checklist|Calendar/.test(file.name)
              ? "Publishing"
              : "Preparation",
          }
        : file.area === "learning"
          ? {
              ...base,
              Programme: folder[1],
              Audience: /Onboarding/.test(file.name)
                ? "New starters"
                : "People managers",
            }
          : {
              ...base,
              Programme: folder[0],
              Activity: /Review|Feedback/.test(file.name)
                ? "Review"
                : "Planning",
            };
    case "employment":
      return file.area === "hiring"
        ? {
            ...base,
            Activity: /Handoff/.test(file.name)
              ? "Recruitment handoff"
              : /Interview|Panel/.test(file.name)
                ? "Panel preparation"
                : "Vacancy setup",
            "Recruitment stage": /Handoff/.test(file.name)
              ? "Handoff"
              : /Interview|Panel/.test(file.name)
                ? "Panel readiness"
                : "Vacancy setup",
          }
        : {
            ...base,
            Activity:
              file.area === "inputs"
                ? "Input-control procedure"
                : "Authorised process handoff",
            "System of record": "Workday HCM",
          };
    case "customer":
      return [
        "relationships",
        "accounts",
        "partnerships",
        "stakeholders",
      ].includes(file.area)
        ? {
            ...base,
            "Relationship type": {
              relationships: "Stewardship",
              accounts: "Business accounts",
              partnerships: "Institutional partnership",
              stakeholders: "Stakeholder engagement",
            }[file.area]!,
            Activity: "Preparation",
          }
        : file.area === "meetings"
          ? {
              ...base,
              Activity: /Negotiation|Options/.test(file.name)
                ? "Negotiation planning"
                : "Meeting preparation",
              "Meeting cycle": "Q4 2026",
            }
          : {
              ...base,
              Activity:
                file.area === "quality"
                  ? "Coaching & calibration"
                  : "Care methods",
              "Review cycle": "October 2026",
            };
    default:
      return {
        ...base,
        Activity:
          {
            retention: "Retention consultation",
            transfer: "Appraisal & transfer",
            cataloguing: "Description",
            preservation: "Preservation",
            projects: "Archive programme",
          }[file.area] || "Archive practice",
        "Record series":
          file.area === "transfer"
            ? "Completed business records"
            : "Archive administration",
      };
  }
}
function contentTypeFor(id: string, file: WorkingFile) {
  if (id === "services" && file.area === "purchasing")
    return /Decision/.test(file.name)
      ? "supplier-decision"
      : /Evaluation|Comparison|Renewal Review/.test(file.name)
        ? "supplier-evaluation"
        : undefined;
  if (id === "quality" && ["process", "improvement"].includes(file.area))
    return file.area === "improvement" && /Brief/.test(file.name)
      ? "improvement-brief"
      : /Review|Notes/.test(file.name)
        ? "process-review"
        : undefined;
  if (id === "digital" && file.area === "architecture")
    return /Decision/.test(file.name) ? "technical-decision" : undefined;
  if (
    id === "digital" &&
    file.area === "information-architecture" &&
    /Design/.test(file.name)
  )
    return "implementation-design";
  if (id === "legal" && file.area === "policy") return "policy-review";
  if (id === "legal" && file.area === "compliance") return "compliance-review";
  if (id === "people" && file.area === "learning")
    return /Review|Feedback/.test(file.name)
      ? "programme-review"
      : /Plan/.test(file.name)
        ? "learning-plan"
        : undefined;
  if (id === "employment")
    return file.area === "hiring"
      ? /Handoff/.test(file.name)
        ? "recruitment-handoff"
        : /Vacancy/.test(file.name)
          ? "vacancy-coordination"
          : undefined
      : "employment-process";
  if (id === "customer" && file.area === "meetings")
    return /Negotiation|Options/.test(file.name)
      ? "negotiation-plan"
      : /Brief/.test(file.name)
        ? "meeting-brief"
        : undefined;
}

/** Enrich the canonical public fixtures once; every surface keeps these IDs. */
export function enrichFunctionalFiles(
  id: string,
  existing: WorkingFile[],
): WorkingFile[] {
  const template = existing[0];
  const added = (additions[id] || []).map(([area, name], index) => ({
    ...template,
    id: `${id}-R${String(index + 1).padStart(2, "0")}`,
    area,
    name,
    type: name.split(".").at(-1)!,
  }));
  return [...existing, ...added].map((file, index) => {
    const owningId =
      id === "people" && ["hiring", "employment"].includes(file.area)
        ? "employment"
        : id;
    const folderPath = folderForFunctionalFile(owningId, file.area, file.name);
    const target =
      id === "services" &&
      file.area === "reception" &&
      folderPath.startsWith("Visitor")
        ? functionalLibraries.services.find(
            (l) => l.id === "bookings-coordination",
          )!
        : functionalLibraries[owningId].find((l) =>
            l.areas.includes(file.area),
          )!;
    const modified = `2026-10-${String(2 + ((index * 3 + file.name.length) % 15)).padStart(2, "0")}`;
    const status: WorkingFile["status"] =
      /Checklist|Guidance|Method|Guide|Criteria|Contract.yaml/.test(file.name)
        ? "Current"
        : /Review|Evaluation|Decision|Feedback/.test(file.name)
          ? "In review"
          : "Draft";
    const result: WorkingFile = {
      ...file,
      ...(owningId !== id
        ? {
            campaign: workspaceById.get(owningId)!.title,
            location: workspaceById.get(owningId)!.title,
          }
        : {}),
      documentLibrary: target.id,
      folderPath,
      folder: folderPath,
      modified,
      status,
      contentType: contentTypeFor(owningId, file),
      owner:
        id === "digital"
          ? "Devon Park"
          : owningId === "employment"
            ? "Employment Operations"
            : id === "people"
              ? "Elena Rossi"
              : file.owner,
    };
    result.metadata = fileMetadata(owningId, result);
    result.workType =
      result.metadata.Activity ||
      result.metadata["Work type"] ||
      "Working document";
    if (
      /Supplier Evaluation|Architecture Decision Record|Manager Capability Programme — Learning Plan|Privacy Assessment — Working Questions/.test(
        file.name,
      )
    ) {
      result.versions = [
        {
          version: "1.2",
          date: modified,
          author: result.owner,
          note: "Review comments and implementation checks incorporated",
          current: true,
        },
        {
          version: "1.1",
          date: "2026-09-25",
          author: result.owner,
          note: "Business-owner review and evidence links added",
          current: false,
        },
        {
          version: "1.0",
          date: "2026-09-10",
          author: result.owner,
          note: "Initial agreed working baseline",
          current: false,
        },
      ];
    }
    return result;
  });
}
