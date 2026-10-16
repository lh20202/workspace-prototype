import type { OperationalFile } from "../logistics/data";
export const title = "Audience Insight & Innovation R&D";
export const description =
  "Shared workspace for researching audiences, developing and testing new approaches, analysing performance and turning evidence into future outreach decisions.";
export const navigation = [
  { id: "research", name: "Research & Discovery" },
  { id: "audiences", name: "Audience & Journeys" },
  { id: "experiments", name: "Experimentation" },
  { id: "analytics", name: "Measurement & Analytics" },
  { id: "decisions", name: "Planning & Decisions" },
  { id: "calendar", name: "Research Calendar" },
];
export interface Experiment {
  variant: string;
  start: string;
  end: string;
  decision: string;
}
export interface Initiative {
  id: string;
  name: string;
  type: string;
  question: string;
  segment: string;
  journey: string;
  channel: string;
  owner: string;
  stage: string;
  measure: string;
  decisionDate: string;
  status: string;
  area: string;
  innovation: boolean;
  experiment?: Experiment;
}
export const initiatives: Initiative[] = [
  {
    id: "RD-101",
    name: "Audience Segmentation Refresh",
    type: "Audience research",
    question:
      "Which behavioural patterns explain different motivations and response needs?",
    segment: "All synthetic segments",
    journey: "Consideration",
    channel: "Cross-channel",
    owner: "Maya Chen",
    stage: "Synthesis",
    measure: "Segment stability",
    decisionDate: "2026-10-23",
    status: "Ready for review",
    area: "audiences",
    innovation: false,
  },
  {
    id: "RD-102",
    name: "New Customer Journey Study",
    type: "UX research",
    question:
      "What supports confidence between first response and early experience?",
    segment: "New Explorers",
    journey: "Early experience",
    channel: "Cross-channel",
    owner: "Jordan Lee",
    stage: "Research underway",
    measure: "Journey completion",
    decisionDate: "2026-10-28",
    status: "Active",
    area: "audiences",
    innovation: true,
  },
  {
    id: "RD-103",
    name: "Website Conversion Friction Study",
    type: "Behavioural analysis",
    question: "Where are users leaving the sign-up journey and why?",
    segment: "Digital Convenience Seekers",
    journey: "Conversion",
    channel: "Website",
    owner: "Alex Morgan",
    stage: "Testing",
    measure: "Conversion rate",
    decisionDate: "2026-10-22",
    status: "Active",
    area: "analytics",
    innovation: true,
    experiment: {
      variant: "A: existing steps / B: simplified sign-up flow",
      start: "2026-10-12",
      end: "2026-10-21",
      decision: "Read-out pending",
    },
  },
  {
    id: "RD-104",
    name: "Retention Propensity Pilot",
    type: "Predictive analysis",
    question:
      "Can behavioural patterns help identify customers at higher risk of disengagement?",
    segment: "Occasional Responders",
    journey: "Retention",
    channel: "Cross-channel",
    owner: "Sam Patel",
    stage: "Analysis",
    measure: "Calibration and subgroup error",
    decisionDate: "2026-10-26",
    status: "Ready for review",
    area: "analytics",
    innovation: true,
  },
  {
    id: "RD-105",
    name: "Emerging Channel Opportunity Scan",
    type: "Market research",
    question: "Which emerging approaches merit a limited outreach pilot?",
    segment: "New Explorers",
    journey: "Awareness",
    channel: "New response channel",
    owner: "Taylor Brooks",
    stage: "Discovery",
    measure: "Qualified response",
    decisionDate: "2026-10-30",
    status: "Active",
    area: "research",
    innovation: true,
  },
  {
    id: "EXP-201",
    name: "Alternative value proposition",
    type: "Experiment",
    question:
      "Does a clearer purpose-led proposition increase qualified responses?",
    segment: "Purpose-Led Regulars",
    journey: "Consideration",
    channel: "Landing page",
    owner: "Maya Chen",
    stage: "Design",
    measure: "Response rate",
    decisionDate: "2026-11-04",
    status: "Planned",
    area: "experiments",
    innovation: true,
    experiment: {
      variant: "A: convenience / B: purpose-led",
      start: "2026-10-26",
      end: "2026-11-02",
      decision: "Approve test design",
    },
  },
  {
    id: "EXP-202",
    name: "Shorter landing-page form",
    type: "Experiment",
    question: "Does reducing optional questions lower abandonment?",
    segment: "Digital Convenience Seekers",
    journey: "Conversion",
    channel: "Website",
    owner: "Alex Morgan",
    stage: "Awaiting decision",
    measure: "Form completion",
    decisionDate: "2026-10-20",
    status: "Ready for review",
    area: "experiments",
    innovation: true,
    experiment: {
      variant: "A: six questions / B: three questions",
      start: "2026-10-01",
      end: "2026-10-12",
      decision: "Continue to wider test",
    },
  },
  {
    id: "EXP-203",
    name: "Reactivation message timing",
    type: "Experiment",
    question:
      "Does a later reminder increase reactivation without increasing opt-out?",
    segment: "Occasional Responders",
    journey: "Reactivation",
    channel: "Email",
    owner: "Jordan Lee",
    stage: "Testing",
    measure: "Reactivation rate",
    decisionDate: "2026-10-27",
    status: "Active",
    area: "experiments",
    innovation: false,
    experiment: {
      variant: "A: day 7 / B: day 14",
      start: "2026-10-13",
      end: "2026-10-25",
      decision: "Await results",
    },
  },
  {
    id: "EXP-204",
    name: "New onboarding sequence",
    type: "Experiment",
    question: "Does a simpler first-week sequence improve early confidence?",
    segment: "New Explorers",
    journey: "Early experience",
    channel: "Email",
    owner: "Taylor Brooks",
    stage: "Design",
    measure: "Early satisfaction",
    decisionDate: "2026-11-05",
    status: "Blocked",
    area: "experiments",
    innovation: true,
    experiment: {
      variant: "A: standard sequence / B: guided sequence",
      start: "2026-10-28",
      end: "2026-11-04",
      decision: "Await accessibility review",
    },
  },
  {
    id: "EXP-205",
    name: "Channel-mix pilot",
    type: "Performance evaluation",
    question: "Which mix balances reach, qualified responses and cost?",
    segment: "Purpose-Led Regulars",
    journey: "Awareness",
    channel: "Cross-channel",
    owner: "Sam Patel",
    stage: "Completed",
    measure: "Cost per conversion",
    decisionDate: "2026-10-14",
    status: "Completed",
    area: "experiments",
    innovation: true,
    experiment: {
      variant: "A: established mix / B: limited new channel",
      start: "2026-09-14",
      end: "2026-09-30",
      decision: "Run limited follow-up pilot",
    },
  },
];
export const initiativeById = new Map(initiatives.map((i) => [i.id, i]));
export interface WorkingFile extends OperationalFile {
  initiativeId: string;
  area: string;
  workType: string;
  review: string;
  coauthors: string[];
}
const file = (
  id: string,
  initiativeId: string,
  area: string,
  folder: string,
  name: string,
  workType: string,
  review = "Working draft",
): WorkingFile => {
  const i = initiativeById.get(initiativeId)!;
  return {
    id,
    initiativeId,
    area,
    folder,
    name,
    workType,
    review,
    coauthors: [i.owner, i.owner === "Maya Chen" ? "Alex Morgan" : "Maya Chen"],
    library: "resources",
    campaign: i.name,
    operation: "Shared operations",
    location: "Aggregate synthetic research",
    type: name.split(".").at(-1)!,
    status: review === "Ready for review" ? "In review" : "Draft",
    owner: i.owner,
    validFrom: "2026-10-01",
    validTo: "2026-12-31",
    modified: "2026-10-16",
    sensitivity: "Internal",
    recordState: "Working information",
  };
};
export const files: WorkingFile[] = [
  file(
    "seg-brief",
    "RD-101",
    "research",
    "Audience Segmentation Refresh",
    "Research brief.docx",
    "Research brief",
  ),
  file(
    "seg-survey",
    "RD-101",
    "research",
    "Audience Segmentation Refresh",
    "Survey design.docx",
    "Study material",
  ),
  file(
    "seg-synthesis",
    "RD-101",
    "research",
    "Audience Segmentation Refresh",
    "Audience segmentation synthesis.pptx",
    "Analysis",
    "Ready for review",
  ),
  file(
    "motivation-guide",
    "RD-102",
    "research",
    "Customer Motivation Study",
    "Discussion guide.docx",
    "Study material",
  ),
  file(
    "journey-findings",
    "RD-102",
    "research",
    "Customer Motivation Study",
    "New customer journey findings.pptx",
    "Analysis",
  ),
  file(
    "competitor-scan",
    "RD-105",
    "research",
    "Competitor & Market Scan",
    "Competitor experience scan.xlsx",
    "Analysis",
  ),
  file(
    "market-synthesis",
    "RD-105",
    "research",
    "Competitor & Market Scan",
    "Market trends synthesis.pptx",
    "Analysis",
  ),
  file(
    "channel-benchmark",
    "RD-105",
    "research",
    "Competitor & Market Scan",
    "Channel benchmarking.xlsx",
    "Analysis",
  ),
  file(
    "usability-guide",
    "RD-103",
    "research",
    "Website Usability Study",
    "Usability discussion guide.docx",
    "Study material",
  ),
  file(
    "usability-findings",
    "RD-103",
    "research",
    "Website Usability Study",
    "Mobile friction findings.pptx",
    "Analysis",
  ),
  file(
    "opportunity-hypotheses",
    "RD-105",
    "research",
    "Emerging Channel Research",
    "Opportunity hypotheses.docx",
    "Research brief",
  ),
  file(
    "seg-model",
    "RD-101",
    "audiences",
    "Customer Segmentation",
    "Audience segmentation working model.pptx",
    "Segmentation model",
    "Ready for review",
  ),
  file(
    "seg-definitions",
    "RD-101",
    "audiences",
    "Customer Segmentation",
    "Segment definitions.xlsx",
    "Segmentation model",
  ),
  file(
    "journey-map",
    "RD-102",
    "audiences",
    "Acquisition Journey",
    "New customer journey map.pptx",
    "Journey model",
  ),
  file(
    "journey-hypotheses",
    "RD-103",
    "audiences",
    "Conversion Journey",
    "Conversion journey hypotheses.docx",
    "Journey model",
  ),
  file(
    "retention-opportunities",
    "RD-104",
    "audiences",
    "Retention Journey",
    "Retention journey opportunities.pptx",
    "Journey model",
  ),
  file(
    "reactivation-plan",
    "EXP-203",
    "audiences",
    "Reactivation Journey",
    "Journey measurement plan.xlsx",
    "Measurement framework",
  ),
  file(
    "signup-hypothesis",
    "RD-103",
    "experiments",
    "A/B Test — Simplified Sign-up Flow",
    "Hypothesis.docx",
    "Research brief",
  ),
  file(
    "signup-design",
    "RD-103",
    "experiments",
    "A/B Test — Simplified Sign-up Flow",
    "Test design.xlsx",
    "Experiment design",
  ),
  file(
    "signup-prototype",
    "RD-103",
    "experiments",
    "A/B Test — Simplified Sign-up Flow",
    "UX prototype notes.pptx",
    "Study material",
  ),
  file(
    "signup-results",
    "RD-103",
    "experiments",
    "A/B Test — Simplified Sign-up Flow",
    "Results analysis.xlsx",
    "Experiment result",
  ),
  file(
    "form-results",
    "EXP-202",
    "experiments",
    "Shorter landing-page form",
    "Form completion results.xlsx",
    "Experiment result",
    "Ready for review",
  ),
  file(
    "channel-results",
    "EXP-205",
    "experiments",
    "Channel-mix pilot",
    "Channel-mix evaluation.pptx",
    "Experiment result",
    "Ready for review",
  ),
  file(
    "measurement-framework",
    "RD-103",
    "analytics",
    "Measurement Frameworks",
    "Outreach measurement framework.xlsx",
    "Measurement framework",
  ),
  file(
    "journey-kpi",
    "RD-102",
    "analytics",
    "Journey Analysis",
    "Customer journey KPI model.xlsx",
    "Measurement framework",
  ),
  file(
    "website-funnel",
    "RD-103",
    "analytics",
    "Website Behaviour & UX",
    "Website conversion funnel — September.pptx",
    "Analysis",
    "Ready for review",
  ),
  file(
    "tracking-plan",
    "RD-103",
    "analytics",
    "Website Behaviour & UX",
    "Website tracking plan.xlsx",
    "Measurement framework",
  ),
  file(
    "channel-comparison",
    "EXP-205",
    "analytics",
    "Channel Analysis",
    "Channel comparison.pptx",
    "Analysis",
  ),
  file(
    "retention-analysis",
    "RD-104",
    "analytics",
    "Performance Analysis",
    "Retention driver analysis.xlsx",
    "Analysis",
  ),
  file(
    "evaluation-template",
    "EXP-202",
    "analytics",
    "Experiment Results",
    "Experiment evaluation template.xlsx",
    "Experiment design",
  ),
  file(
    "model-brief",
    "RD-104",
    "analytics",
    "Predictive Analytics",
    "Model brief.docx",
    "Research brief",
  ),
  file(
    "feature-assessment",
    "RD-104",
    "analytics",
    "Predictive Analytics",
    "Feature assessment.xlsx",
    "Analysis",
  ),
  file(
    "validation-summary",
    "RD-104",
    "analytics",
    "Predictive Analytics",
    "Validation summary.pptx",
    "Analysis",
    "Ready for review",
  ),
  file(
    "model-limitations",
    "RD-104",
    "analytics",
    "Predictive Analytics",
    "Bias & limitations review.docx",
    "Analysis",
  ),
  file(
    "periodic-report",
    "EXP-205",
    "analytics",
    "Periodic Reporting",
    "Q3 conversion analysis.pptx",
    "Analysis",
  ),
  file(
    "audience-priorities",
    "RD-101",
    "decisions",
    "Planning inputs",
    "Audience priorities — working draft.pptx",
    "Recommendation",
  ),
  file(
    "journey-recommendations",
    "RD-102",
    "decisions",
    "Recommendations",
    "Journey improvement recommendations.pptx",
    "Recommendation",
  ),
  file(
    "signup-decision",
    "RD-103",
    "decisions",
    "Decision briefs",
    "Decision summary.docx",
    "Decision brief",
  ),
  file(
    "q4-recommendations",
    "EXP-202",
    "decisions",
    "Recommendations",
    "Experiment recommendations — Q4.docx",
    "Recommendation",
  ),
  file(
    "model-recommendation",
    "RD-104",
    "decisions",
    "Recommendations",
    "Predictive model recommendation.docx",
    "Recommendation",
  ),
  file(
    "innovation-proposal",
    "RD-105",
    "decisions",
    "Innovation proposals",
    "Innovation proposal — New response channel.docx",
    "Recommendation",
  ),
  file(
    "measurement-priorities",
    "RD-101",
    "decisions",
    "Measurement requirements",
    "Measurement priorities.xlsx",
    "Measurement framework",
  ),
];
export const filesById = new Map(files.map((f) => [f.id, f]));
export const decisions = [
  {
    id: "DEC-31",
    initiativeId: "RD-103",
    question: "Simplified sign-up flow",
    evidence: "signup-results",
    recommendation: "Complete read-out before extending",
    owner: "Alex Morgan",
    status: "Awaiting review",
    date: "2026-10-22",
    followup: "Test accessibility and review conversion evidence",
  },
  {
    id: "DEC-32",
    initiativeId: "EXP-202",
    question: "Shorter landing-page form",
    evidence: "form-results",
    recommendation: "Continue to wider test",
    owner: "Maya Chen",
    status: "Approved for next stage",
    date: "2026-10-20",
    followup: "Feed wider test into Q4 planning",
  },
  {
    id: "DEC-33",
    initiativeId: "RD-104",
    question: "Retention propensity model",
    evidence: "validation-summary",
    recommendation: "Refine before operational use",
    owner: "Sam Patel",
    status: "More evidence required",
    date: "2026-10-26",
    followup: "Review subgroup error and limitations before any use",
  },
  {
    id: "DEC-34",
    initiativeId: "RD-105",
    question: "New channel opportunity",
    evidence: "market-synthesis",
    recommendation: "Run limited pilot",
    owner: "Taylor Brooks",
    status: "Approved",
    date: "2026-10-30",
    followup: "Include limited pilot in future outreach planning",
  },
];
export const registerViews = [
  "All Initiatives",
  "Active Research",
  "Experiments Running",
  "Awaiting Decision",
  "Audience & Segmentation",
  "Website & UX",
  "Analytics & Measurement",
  "Completed & Learned",
  "Innovation Pipeline",
];
export function queryInitiatives(
  items: Initiative[],
  view: string,
  search = "",
  stage = "",
  status = "",
) {
  return items.filter(
    (i) =>
      (!stage || i.stage === stage) &&
      (!status || i.status === status) &&
      `${i.name} ${i.question} ${i.segment} ${i.owner}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (view !== "Active Research" ||
        (!i.experiment && i.status !== "Completed")) &&
      (view !== "Experiments Running" ||
        (!!i.experiment && i.stage === "Testing")) &&
      (view !== "Awaiting Decision" || i.stage === "Awaiting decision") &&
      (view !== "Audience & Segmentation" || i.area === "audiences") &&
      (view !== "Website & UX" ||
        i.channel === "Website" ||
        i.channel === "Landing page" ||
        i.type === "UX research") &&
      (view !== "Analytics & Measurement" ||
        i.area === "analytics" ||
        i.type === "Performance evaluation") &&
      (view !== "Completed & Learned" || i.status === "Completed") &&
      (view !== "Innovation Pipeline" || i.innovation),
  );
}
export const libraryViews = [
  "All Working Files",
  "Active Work",
  "Audience Research",
  "Website & UX",
  "Journeys & Segmentation",
  "Experiments",
  "Measurement & Analytics",
  "Awaiting Review",
  "Awaiting Decision",
  "Completed & Learned",
];
export function queryFiles(
  area: string,
  items: Initiative[],
  view: string,
  search = "",
  folder = "",
) {
  return files.filter((f) => {
    const i = items.find((i) => i.id === f.initiativeId)!;
    return (
      (view === "All Working Files" ? f.area === area : true) &&
      (!folder || f.folder === folder) &&
      `${f.name} ${f.campaign} ${f.owner}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (view !== "Active Work" || i.status !== "Completed") &&
      (view !== "Audience Research" || i.type === "Audience research") &&
      (view !== "Website & UX" || i.id === "RD-103") &&
      (view !== "Journeys & Segmentation" || f.area === "audiences") &&
      (view !== "Experiments" || f.area === "experiments") &&
      (view !== "Measurement & Analytics" || f.area === "analytics") &&
      (view !== "Awaiting Review" || i.status === "Ready for review") &&
      (view !== "Awaiting Decision" || i.stage === "Awaiting decision") &&
      (view !== "Completed & Learned" || i.status === "Completed")
    );
  });
}
export const segments = [
  {
    name: "New Explorers",
    size: "24%",
    behaviour: "Compare several entry points",
    motivation: "Understand the purpose",
    channel: "Search & introduction",
    conversion: "Medium",
    risk: "Medium",
    confidence: "Moderate",
  },
  {
    name: "Purpose-Led Regulars",
    size: "21%",
    behaviour: "Respond to clear purpose-led messages",
    motivation: "Visible contribution",
    channel: "Email & community",
    conversion: "High",
    risk: "Low",
    confidence: "Moderate",
  },
  {
    name: "Digital Convenience Seekers",
    size: "27%",
    behaviour: "Prefer fast mobile journeys",
    motivation: "Simple, clear steps",
    channel: "Mobile web",
    conversion: "Medium",
    risk: "Medium",
    confidence: "High",
  },
  {
    name: "Occasional Responders",
    size: "18%",
    behaviour: "Re-engage at irregular intervals",
    motivation: "Relevant prompts",
    channel: "Email",
    conversion: "Low",
    risk: "High",
    confidence: "Low",
  },
  {
    name: "Long-Term Loyalists",
    size: "10%",
    behaviour: "Return through familiar touchpoints",
    motivation: "Continuity and trust",
    channel: "Direct & email",
    conversion: "High",
    risk: "Low",
    confidence: "Moderate",
  },
];
export const journey = [
  {
    stage: "Awareness",
    behaviour: "Discover an unfamiliar proposition",
    question: "Is this relevant to me?",
    friction: "Unclear purpose",
    touchpoints: "Search, new channel, referral",
    evidence: "Synthetic channel scan",
    gap: "Emerging-channel motivations",
    test: "Test clearer value proposition",
    file: "competitor-scan",
  },
  {
    stage: "Consideration",
    behaviour: "Compare benefits and effort",
    question: "Why should I respond?",
    friction: "Too much unexplained detail",
    touchpoints: "Landing page, email",
    evidence: "Motivation study synthesis",
    gap: "Confidence by segment",
    test: "Purpose-led message variants",
    file: "journey-findings",
  },
  {
    stage: "First response",
    behaviour: "Try the first interaction",
    question: "What happens next?",
    friction: "Unclear confirmation",
    touchpoints: "Response form",
    evidence: "Synthetic session-path summary",
    gap: "Expectation after first click",
    test: "Preview next steps",
    file: "usability-findings",
  },
  {
    stage: "Conversion",
    behaviour: "Complete sign-up steps",
    question: "Is this worth the effort?",
    friction: "Optional fields and mobile layout",
    touchpoints: "Mobile web form",
    evidence: "Funnel analysis and usability sessions",
    gap: "Accessibility and confidence",
    test: "Simplified sign-up flow",
    file: "signup-results",
  },
  {
    stage: "Early experience",
    behaviour: "Look for useful guidance",
    question: "How do I get started?",
    friction: "Too many initial messages",
    touchpoints: "Onboarding email",
    evidence: "New journey findings",
    gap: "First-week reassurance",
    test: "New onboarding sequence",
    file: "journey-map",
  },
  {
    stage: "Ongoing relationship",
    behaviour: "Return when there is a clear reason",
    question: "What is useful now?",
    friction: "Irrelevant cadence",
    touchpoints: "Email, content",
    evidence: "Synthetic retention driver analysis",
    gap: "Needs changing over time",
    test: "Relevant content cadence",
    file: "retention-analysis",
  },
  {
    stage: "Retention",
    behaviour: "Continue, pause or re-engage",
    question: "Does this still meet my needs?",
    friction: "Weak relevance signals",
    touchpoints: "Email and direct visits",
    evidence: "Aggregate model validation",
    gap: "Uncertain subgroup performance",
    test: "Reminder timing before any model use",
    file: "model-limitations",
  },
];
export const measures = [
  {
    name: "Conversion rate",
    definition: "Completed sign-ups / eligible journey starts",
    use: "Simplified flow experiment",
    guardrail: "Track accessibility and abandonment alongside completion",
  },
  {
    name: "Response rate",
    definition: "Qualified responses / eligible exposures",
    use: "Value proposition and channel tests",
    guardrail: "Use comparable audience and exposure windows",
  },
  {
    name: "Retention rate",
    definition: "Continuing active audience / eligible starting cohort",
    use: "Retention pilot evaluation",
    guardrail: "Aggregate cohorts only; no individual risk scores",
  },
  {
    name: "Reactivation rate",
    definition: "Returning audience / eligible inactive cohort",
    use: "Reminder timing",
    guardrail: "Review opt-out and relevance",
  },
  {
    name: "Journey completion",
    definition: "Audience reaching agreed final stage / journey starts",
    use: "Journey study",
    guardrail: "Document missing tracking and assisted journeys",
  },
  {
    name: "Drop-off rate",
    definition: "Stage exits / stage entries",
    use: "Website friction analysis",
    guardrail: "Do not interpret correlation as cause",
  },
  {
    name: "Cost per conversion",
    definition: "Allocated test cost / completed conversions",
    use: "Channel-mix evaluation",
    guardrail: "Synthetic amounts; include attribution limitations",
  },
  {
    name: "Satisfaction",
    definition: "Aggregate post-experience rating",
    use: "Onboarding study",
    guardrail: "Report response bias and sample uncertainty",
  },
];
export const webEvidence = [
  {
    name: "Landing-page drop-off",
    finding: "38% synthetic exit rate",
    interpretation: "Message relevance needs testing",
  },
  {
    name: "Form abandonment",
    finding: "46% abandon after form start",
    interpretation: "Review optional questions",
  },
  {
    name: "Page-path analysis",
    finding: "3 common aggregate paths",
    interpretation: "Confirmation route needs clearer cues",
  },
  {
    name: "Mobile usability",
    finding: "7 of 12 synthetic sessions report friction",
    interpretation: "Review keyboard and field layout",
  },
  {
    name: "Navigation behaviour",
    finding: "18% return to the previous page",
    interpretation: "Test clearer next-step labels",
  },
  {
    name: "Conversion funnel",
    finding: "9,600 starts → 1,555 completions",
    interpretation: "Use eligible starts consistently",
  },
  {
    name: "Content interaction",
    finding: "42% open explanation content",
    interpretation: "Test progressive disclosure",
  },
  {
    name: "Traffic-source comparison",
    finding: "Search 18%; email 23% completion",
    interpretation: "Audience differences may confound this comparison",
  },
];
export const calendarItems = [
  {
    id: "session-1",
    date: "2026-10-19",
    time: "10:00",
    name: "Customer interviews",
    initiativeId: "RD-102",
    owner: "Jordan Lee",
  },
  {
    id: "session-2",
    date: "2026-10-20",
    time: "14:00",
    name: "Usability sessions",
    initiativeId: "RD-103",
    owner: "Alex Morgan",
  },
  {
    id: "session-3",
    date: "2026-10-21",
    time: "11:00",
    name: "Segmentation workshop",
    initiativeId: "RD-101",
    owner: "Maya Chen",
  },
  {
    id: "session-4",
    date: "2026-10-22",
    time: "15:00",
    name: "Experiment read-out",
    initiativeId: "RD-103",
    owner: "Alex Morgan",
  },
  {
    id: "session-5",
    date: "2026-10-26",
    time: "09:30",
    name: "Experiment launch",
    initiativeId: "EXP-201",
    owner: "Maya Chen",
  },
  {
    id: "session-6",
    date: "2026-10-27",
    time: "10:00",
    name: "Monthly performance review",
    initiativeId: "EXP-205",
    owner: "Sam Patel",
  },
  {
    id: "session-7",
    date: "2026-10-29",
    time: "13:00",
    name: "Innovation review session",
    initiativeId: "RD-105",
    owner: "Taylor Brooks",
  },
  {
    id: "session-8",
    date: "2026-10-30",
    time: "11:00",
    name: "Research synthesis workshop",
    initiativeId: "RD-101",
    owner: "Maya Chen",
  },
];
export const currentIds = ["RD-101", "RD-102", "RD-103", "RD-104", "RD-105"];
export const latestAnalysis = [
  "website-funnel",
  "seg-synthesis",
  "retention-analysis",
  "competitor-scan",
  "journey-findings",
];
export const fileHref = (f: WorkingFile) =>
  `/audience-innovation/${f.area}?file=${f.id}`;
export const initiativeHref = (i: Initiative) =>
  `/audience-innovation/${i.area}?initiative=${i.id}`;
export const stages = [
  "Discovery",
  "Design",
  "Research underway",
  "Testing",
  "Analysis",
  "Synthesis",
  "Awaiting decision",
  "Completed",
];
export const statuses = [
  "Planned",
  "Active",
  "Blocked",
  "Ready for review",
  "Completed",
];
export function updateStage(item: Initiative, stage: string): Initiative {
  return {
    ...item,
    stage,
    status:
      stage === "Completed"
        ? "Completed"
        : stage === "Awaiting decision" || stage === "Synthesis"
          ? "Ready for review"
          : stage === "Design"
            ? "Planned"
            : "Active",
  };
}
export function pipelineStage(i: Initiative) {
  return i.stage === "Discovery"
    ? "Explore"
    : i.stage === "Design"
      ? "Prototype"
      : i.stage === "Testing"
        ? "Test"
        : i.stage === "Analysis"
          ? "Evaluate"
          : i.stage === "Awaiting decision" || i.stage === "Completed"
            ? "Decide"
            : "Research";
}
