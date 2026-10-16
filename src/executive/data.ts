import type { OperationalFile } from "../logistics/data";
export const title = "CEO & Executive Committee";
export const description =
  "Shared workspace for executive coordination, organisation-wide decisions, governance liaison and oversight of strategic initiatives.";
export type ExecutiveRole =
  "base" | "leadership" | "oversight" | "initiative" | "initiative-review";
export const roles: { id: ExecutiveRole; name: string; person: string }[] = [
  { id: "base", name: "Executive Coordinator", person: "Robin Avery" },
  { id: "leadership", name: "Leadership Team member", person: "Avery Quinn" },
  { id: "oversight", name: "Governance Coordinator", person: "Harper Cole" },
  {
    id: "initiative",
    name: "Strategic Initiatives Lead · Digital Service Renewal",
    person: "Cameron Bell",
  },
  {
    id: "initiative-review",
    name: "Strategic Initiative Review participant",
    person: "Riley Drew",
  },
];
export const navigation = [
  { id: "coordination", name: "Executive Coordination" },
  { id: "leadership", name: "Leadership Team", restricted: true },
  { id: "oversight", name: "Oversight Committee Liaison", restricted: true },
  { id: "initiatives", name: "Strategic Initiatives", restricted: true },
  { id: "decisions", name: "Decisions & Actions" },
  { id: "calendar", name: "Executive Calendar" },
];
export function canAccess(area: string, role: ExecutiveRole) {
  return area === "leadership"
    ? role === "leadership"
    : area === "oversight"
      ? role === "oversight"
      : area === "initiatives"
        ? role === "initiative" || role === "initiative-review"
        : true;
}
export interface ExecutiveFile extends OperationalFile {
  audience: ExecutiveRole;
  activity: string;
}
const seeds: [string, string, ExecutiveRole, string][] = [
  ["EX-01", "Governance Submission Schedule.xlsx", "base", "coordination"],
  ["EX-02", "Leadership Actions — October.xlsx", "base", "decisions"],
  [
    "EX-03",
    "2027 Priorities — Approved Briefing Schedule.docx",
    "base",
    "coordination",
  ],
  [
    "EX-04",
    "Digital Service Renewal — Approved Stage Summary.pptx",
    "base",
    "coordination",
  ],
  [
    "EX-11",
    "21 October — Agenda & Pre-read Index.docx",
    "leadership",
    "leadership",
  ],
  [
    "EX-12",
    "2027 Priorities — Decision Brief.docx",
    "leadership",
    "leadership",
  ],
  [
    "EX-13",
    "Service Transformation — Options Review.docx",
    "leadership",
    "leadership",
  ],
  [
    "EX-21",
    "Committee Submission — Executive Preparation.docx",
    "oversight",
    "oversight",
  ],
  [
    "EX-22",
    "Committee Questions — Response Coordination.xlsx",
    "oversight",
    "oversight",
  ],
  [
    "EX-31",
    "Digital Service Renewal — Stage Review.pptx",
    "initiative",
    "initiatives",
  ],
  [
    "EX-32",
    "Digital Service Renewal — Benefits Summary.docx",
    "initiative",
    "initiatives",
  ],
];
export const files: ExecutiveFile[] = seeds.map(
  ([id, name, audience, activity]) => ({
    id,
    name,
    audience,
    activity,
    library: "operations",
    folder: activity,
    campaign: title,
    operation: "Shared operations",
    location: "Executive working context",
    type: name.endsWith("xlsx")
      ? "Excel"
      : name.endsWith("pptx")
        ? "PowerPoint"
        : "Word",
    status: "Current",
    owner: roles.find((r) => r.id === audience)!.person,
    validFrom: "2026-10-01",
    validTo: "2026-10-31",
    modified: "2026-10-16",
    sensitivity: "Internal",
    recordState:
      audience === "base" ? "Current resource" : "Working information",
  }),
);
export function visibleFiles(role: ExecutiveRole) {
  return files.filter(
    (f) =>
      f.audience === "base" ||
      f.audience === role ||
      (role === "initiative-review" && f.audience === "initiative"),
  );
}
export const views = [
  "Upcoming Decisions",
  "Awaiting Input",
  "Leadership Actions",
  "Strategic Initiative Reviews",
  "Governance Submissions",
  "Recently Approved",
];
export interface Decision {
  id: string;
  name: string;
  body: string;
  date: string;
  sponsor: string;
  status: string;
  area: string;
  source: string;
  owner: string;
  followup: string;
  audience: ExecutiveRole;
}
export const decisions: Decision[] = [
  {
    id: "ED-101",
    name: "Approve 2027 operating priorities",
    body: "Leadership Team",
    date: "2026-10-21",
    sponsor: "Avery Quinn",
    status: "For decision",
    area: "leadership",
    source: "/planning/strategy",
    owner: "Avery Quinn",
    followup: "2026-10-28",
    audience: "base",
  },
  {
    id: "ED-102",
    name: "Review service-transformation investment",
    body: "Leadership Team",
    date: "2026-10-21",
    sponsor: "Cameron Bell",
    status: "For decision",
    area: "leadership",
    source: "/services/projects",
    owner: "Cameron Bell",
    followup: "2026-10-30",
    audience: "base",
  },
  {
    id: "ED-103",
    name: "Confirm Strategic Initiative Alpha next stage",
    body: "Strategic Initiatives",
    date: "2026-10-23",
    sponsor: "Cameron Bell",
    status: "Awaiting input",
    area: "initiatives",
    source: "/content-delivery/digital",
    owner: "Cameron Bell",
    followup: "2026-10-30",
    audience: "base",
  },
  {
    id: "ED-104",
    name: "Submit annual governance report",
    body: "Oversight Committee",
    date: "2026-10-28",
    sponsor: "Harper Cole",
    status: "Preparing submission",
    area: "oversight",
    source: "/governance/oversight",
    owner: "Harper Cole",
    followup: "2026-11-04",
    audience: "base",
  },
  {
    id: "ED-105",
    name: "Temporary operating measure",
    body: "Leadership Team",
    date: "2026-10-21",
    sponsor: "Avery Quinn",
    status: "Approved with conditions",
    area: "leadership",
    source: "/executive/leadership",
    owner: "Avery Quinn",
    followup: "2026-10-22",
    audience: "leadership",
  },
  {
    id: "ED-099",
    name: "Publish approved planning timetable",
    body: "Leadership Team",
    date: "2026-10-14",
    sponsor: "Robin Avery",
    status: "Approved",
    area: "decisions",
    source: "/planning/cycles",
    owner: "Robin Avery",
    followup: "2026-10-20",
    audience: "base",
  },
];
export function visibleDecisions(role: ExecutiveRole) {
  return decisions.filter((d) => d.audience === "base" || d.audience === role);
}
export function decisionView(records: Decision[], view: string) {
  return records.filter((d) =>
    view === "Recently Approved"
      ? /Approved|Completed/.test(d.status)
      : view === "Awaiting Input"
        ? /input|Preparing/.test(d.status)
        : view === "Governance Submissions"
          ? d.area === "oversight"
          : view === "Strategic Initiative Reviews"
            ? d.area === "initiatives"
            : view === "Leadership Actions"
              ? /Approved/.test(d.status)
              : !/Approved|Completed/.test(d.status),
  );
}
export const briefings = [
  {
    name: "2027 operating priorities",
    purpose: "Decision request",
    sponsor: "Avery Quinn",
    destination: "Leadership Team",
    due: "2026-10-19",
    stage: "Inputs required",
    decision: "Yes",
    source: "/planning/strategy",
  },
  {
    name: "Quarterly organisational performance review",
    purpose: "Approved reporting follow-up",
    sponsor: "Robin Avery",
    destination: "CEO",
    due: "2026-10-20",
    stage: "Ready",
    decision: "No",
    source: "/planning/reporting",
  },
  {
    name: "Three-year investment outlook",
    purpose: "Executive review coordination",
    sponsor: "Cameron Bell",
    destination: "Strategic Initiative Review",
    due: "2026-10-22",
    stage: "Preparing",
    decision: "Yes",
    source: "/financial-operations/planning",
  },
  {
    name: "Annual governance submission",
    purpose: "Submission coordination",
    sponsor: "Harper Cole",
    destination: "Oversight Committee",
    due: "2026-10-28",
    stage: "Executive review",
    decision: "Yes",
    source: "/executive/oversight",
  },
];
export const briefingStages = [
  "Preparing",
  "Inputs required",
  "Executive review",
  "Ready",
  "Submitted",
  "Closed",
];
export const initiativeStages = [
  "Explore",
  "Assess",
  "Approved",
  "In Delivery",
  "At Risk",
  "Review",
  "Closing",
  "Completed",
];
export const initiatives = [
  {
    id: "SI-01",
    name: "Digital Service Renewal",
    sponsor: "Cameron Bell",
    purpose: "Renew the digital service experience",
    stage: "Review",
    investment: "Indicative · owner review",
    capacity: "Delivery capacity review",
    contribution: "Accessible digital services",
    status: "Stage review",
    decision: "Proceed to implementation",
    review: "2026-10-23",
    delivery: "/content-delivery/digital",
  },
  {
    id: "SI-02",
    name: "Workplace Modernisation",
    sponsor: "Riley Drew",
    purpose: "Improve shared workplace capability",
    stage: "Assess",
    investment: "Revised envelope",
    capacity: "Specialist contribution",
    contribution: "Effective workplace",
    status: "Awaiting decision",
    decision: "Approve revised investment envelope",
    review: "2026-10-26",
    delivery: "/services/workplace",
  },
  {
    id: "SI-03",
    name: "Customer Experience Programme",
    sponsor: "Quinn Harper",
    purpose: "Assess the end-to-end customer experience",
    stage: "Explore",
    investment: "Assessment only",
    capacity: "Research contribution",
    contribution: "Customer understanding",
    status: "In assessment",
    decision: "Confirm assessment scope",
    review: "2026-10-27",
    delivery: "/audience-innovation/research",
  },
  {
    id: "SI-04",
    name: "Enterprise Data Capability",
    sponsor: "Riley Drew",
    purpose: "Improve common measurement capability",
    stage: "Assess",
    investment: "Options under review",
    capacity: "Capacity assessment",
    contribution: "Evidence-led decisions",
    status: "Review",
    decision: "Further assessment required",
    review: "2026-10-28",
    delivery: "/services/projects",
  },
  {
    id: "SI-05",
    name: "Operating Model Review",
    sponsor: "Avery Quinn",
    purpose: "Review organisational dependencies",
    stage: "Review",
    investment: "Pre-decision",
    capacity: "Pending capacity review",
    contribution: "Sustainable operations",
    status: "Paused",
    decision: "Pause pending capacity review",
    review: "2026-10-29",
    delivery: "/services/projects",
  },
];
export function visibleInitiatives(role: ExecutiveRole) {
  return role === "initiative-review"
    ? initiatives
    : role === "initiative"
      ? initiatives.filter((x) => x.id === "SI-01")
      : [];
}
export const executiveCalendar = [
  {
    day: 19,
    name: "Executive briefing deadline",
    href: "/executive/coordination",
  },
  { day: 21, name: "Leadership Team meeting", href: "/executive/leadership" },
  {
    day: 23,
    name: "Strategic Initiative review",
    href: "/executive/initiatives",
  },
  { day: 26, name: "Planning review", href: "/planning/cycles" },
  {
    day: 28,
    name: "Oversight Committee submission deadline",
    href: "/executive/oversight",
  },
  { day: 30, name: "Governance meeting", href: "/governance/calendar" },
];
