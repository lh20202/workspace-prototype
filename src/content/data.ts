import {
  externalEnvironmentForTool,
  externalPreviewHref,
} from "../environments/catalog";
import type { OperationalFile } from "../logistics/data";
import { matchesDisplayText } from "../i18n/search";
export const title = "Creative Studio";
export const description =
  "Shared production space where channel teams and topic specialists plan, create, review and release public-facing work.";
export const demoToday = "2026-10-16";
export const navigation = [
  { id: "pipeline", name: "Content Pipeline" },
  { id: "editorial", name: "Messaging & Editorial" },
  { id: "creative", name: "Creative Production" },
  { id: "channels", name: "Channels & Formats" },
  { id: "digital", name: "Digital Content & Experience" },
  { id: "partners", name: "External Partners" },
  { id: "calendar", name: "Production Calendar" },
];
const allTools = [
  {
    id: "planable",
    name: "Planable",
    purpose:
      "Content planning, collaborative review and detailed channel scheduling",
    url: "https://planable.io/",
  },
  {
    id: "contentful",
    name: "Contentful",
    purpose: "Website content, pages and reusable digital content",
    url: "https://www.contentful.com/",
  },
  {
    id: "affinity",
    name: "Affinity",
    purpose: "Creative design and production; exported working reviews",
    url: "https://www.affinity.studio/",
  },
  {
    id: "wistia",
    name: "Wistia",
    purpose: "Hosted video, review and final video delivery",
    url: "https://wistia.com/",
  },
  {
    id: "cvent",
    name: "Cvent",
    purpose: "Registration, programme and live/virtual delivery",
    url: "https://www.cvent.com/",
  },
  {
    id: "asana",
    name: "Asana",
    purpose: "Production tasks and delivery coordination",
    url: "https://asana.com/",
  },
  {
    id: "notion",
    name: "Notion",
    purpose: "Collaborative briefs and scoped partner-facing working notes",
    url: "https://www.notion.com/",
  },
  {
    id: "webex",
    name: "Webex",
    purpose: "Virtual sessions and production meetings",
    url: "https://www.webex.com/",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    purpose: "Authoritative customer/contact and permission references",
    url: "https://www.salesforce.com/",
  },
  {
    id: "netsuite",
    name: "Oracle NetSuite",
    purpose: "Supplier and commercial transaction references",
    url: "https://www.netsuite.com/",
  },
];
export const tools = allTools
  .filter(
    (t) =>
      ![
        "github",
        "datadog",
        "staffbase",
        "openproject",
        "piwik",
        "vwo",
        "brandwatch",
        "semrush",
      ].includes(t.id),
  )
  .map((tool) => ({
    ...tool,
    name: externalEnvironmentForTool(tool.id)?.name || tool.name,
  }));
export const quickToolIds = ["planable", "contentful", "wistia"];
export type Rights =
  | "Cleared"
  | "Pending confirmation"
  | "Restricted use"
  | "Expired"
  | "Do not publish";
export interface Package {
  id: string;
  name: string;
  purpose: string;
  audience: string;
  formats: string[];
  channels: string[];
  lead: string;
  stage: string;
  status: string;
  reviewDue: string;
  releaseDate: string;
  partner?: string;
  partnerType?: string;
  rights: Rights;
  rightsReference: string;
  condition: string;
  permitted: string[];
  embargo?: string;
  reviews: { type: string; status: string }[];
  refs: { tool: string; id: string }[];
  research: string;
  product: string;
  productionModel: string;
  testing: string;
}
const p = (id: string, name: string, over: Partial<Package>): Package => ({
  id,
  name,
  purpose: "Develop clear, useful public-facing content",
  audience: "General public",
  formats: ["Editorial"],
  channels: ["Website"],
  lead: "Alex Morgan",
  stage: "Development",
  status: "On track",
  reviewDue: "2026-10-20",
  releaseDate: "2026-10-28",
  rights: "Cleared",
  rightsReference: `SF-${4800 + Number(id.slice(-3))}`,
  condition: "Use approved assets and complete publisher review.",
  permitted: ["Website"],
  reviews: [
    { type: "Editorial", status: "Pending" },
    { type: "Final publisher", status: "Pending" },
  ],
  refs: [{ tool: "planable", id: `PLN-${2400 + Number(id.slice(-3))}` }],
  research: "/audience-innovation/decisions",
  product: name,
  productionModel:
    "Brief → working draft → specialist review → channel preparation",
  testing: "Review clarity, accessibility and audience fit before release.",
  ...over,
});
export const packages: Package[] = [
  p("PKG-101", "Customer Welcome Series", {
    purpose: "Improve early customer experience",
    audience: "New customers",
    formats: ["Email sequence", "Landing page", "Short video"],
    channels: ["Email", "Website", "Video"],
    permitted: ["Email", "Website", "Video"],
    stage: "Creative production",
    status: "Needs review",
    reviewDue: "2026-10-16",
    releaseDate: "2026-10-22",
    refs: [
      { tool: "planable", id: "PLN-2408" },
      { tool: "contentful", id: "CTF-3921" },
      { tool: "wistia", id: "WIS-110" },
    ],
    research: "/audience-innovation/audiences?initiative=RD-102",
    product: "Email series",
    productionModel:
      "Reusable sequence with landing-page and short-video adaptations",
  }),
  p("PKG-102", "Public Information Landing Page", {
    purpose: "Explain a complex service clearly",
    formats: ["Landing page", "Social copy"],
    channels: ["Website", "Social"],
    permitted: ["Website", "Social"],
    stage: "Review",
    status: "Needs review",
    lead: "Alex Morgan",
    reviewDue: "2026-10-19",
    releaseDate: "2026-10-23",
    refs: [
      { tool: "contentful", id: "CTF-3924" },
      { tool: "vwo", id: "EXP-118" },
      { tool: "piwik", id: "PA-204" },
      { tool: "semrush", id: "SEO-092" },
      { tool: "planable", id: "PLN-2412" },
    ],
    research: "/audience-innovation/analytics?initiative=RD-103",
    product: "Public information landing pages",
    testing:
      "A/B headline variants; primary measure: completion rate. Review accessibility alongside completion.",
  }),
  p("PKG-103", "Service Explainer Video", {
    purpose: "Explain a service through short-form video",
    formats: ["Video", "Audio"],
    channels: ["Video", "Website"],
    permitted: ["Video", "Website"],
    stage: "Creative production",
    status: "Needs review",
    lead: "Alex Morgan",
    partner: "Silver Fern Creative",
    partnerType: "Creative / video studio",
    reviewDue: "2026-10-20",
    releaseDate: "2026-10-24",
    reviews: [
      { type: "Editorial", status: "Approved" },
      { type: "Brand", status: "Approved" },
      { type: "Rights", status: "Approved" },
      { type: "Final publisher", status: "Pending" },
    ],
    refs: [
      { tool: "wistia", id: "WIS-117" },
      { tool: "affinity", id: "AF-103" },
      { tool: "planable", id: "PLN-2418" },
      { tool: "netsuite", id: "NS-1103" },
    ],
    product: "Explainer video format",
    productionModel: "Brief → storyboard → rough cut → captions → final export",
  }),
  p("PKG-104", "Community Webinar Package", {
    purpose: "Deliver a live public information session",
    formats: ["Live / virtual", "Presentation / display"],
    channels: ["Live / virtual", "Email"],
    permitted: ["Live / virtual", "Email"],
    stage: "Creative production",
    status: "Needs review",
    lead: "Taylor Brooks",
    partner: "Harbour Event Production",
    partnerType: "Event-production partner",
    rights: "Pending confirmation",
    condition:
      "Speaker material clearance required before external distribution.",
    reviewDue: "2026-10-21",
    releaseDate: "2026-10-28",
    refs: [
      { tool: "cvent", id: "CV-091" },
      { tool: "webex", id: "WX-281" },
      { tool: "planable", id: "PLN-2420" },
    ],
    product: "Webinar format",
    productionModel:
      "Programme brief, speaker review, registration copy and run-of-show",
  }),
  p("PKG-105", "Mobile Sign-up Experience", {
    purpose: "Reduce friction in the mobile sign-up journey",
    audience: "Digital Convenience Seekers",
    formats: ["Forms", "Landing page"],
    channels: ["Website"],
    lead: "Alex Morgan",
    stage: "Review",
    status: "Needs input",
    partner: "Juniper Digital Studio",
    partnerType: "UX content review studio",
    reviewDue: "2026-10-20",
    releaseDate: "2026-10-29",
    reviews: [
      { type: "Editorial", status: "Approved" },
      { type: "Privacy", status: "Approved" },
      { type: "Technical", status: "Pending" },
      { type: "Final publisher", status: "Pending" },
    ],
    refs: [
      { tool: "github", id: "GH-PR-142" },
      { tool: "contentful", id: "CTF-3950" },
      { tool: "vwo", id: "EXP-124" },
      { tool: "asana", id: "AS-312" },
      { tool: "datadog", id: "DD-051" },
      { tool: "piwik", id: "PA-211" },
      { tool: "openproject", id: "OP-104" },
    ],
    research: "/audience-innovation/analytics?initiative=RD-103",
    product: "Interactive sign-up journey",
    productionModel:
      "Content requirements → UX copy → studio handoff → CMS → acceptance → experiment → measurement",
    testing:
      "Accessibility, form validation, approved data-flow requirements and content acceptance.",
  }),
  p("PKG-106", "Quarterly Audience Update", {
    purpose: "Share a clear audience-focused progress update",
    formats: ["Email", "Presentation / display"],
    channels: ["Email", "Website"],
    permitted: ["Email", "Website"],
    stage: "Ready for delivery",
    status: "Ready",
    lead: "Taylor Brooks",
    reviewDue: "2026-10-15",
    releaseDate: "2026-10-21",
    reviews: [
      { type: "Editorial", status: "Approved" },
      { type: "Final publisher", status: "Approved" },
    ],
    product: "Monthly customer update",
    refs: [
      { tool: "planable", id: "PLN-2422" },
      { tool: "staffbase", id: "SB-067" },
    ],
  }),
  p("PKG-107", "Access to Care Story Package", {
    purpose: "Develop a generic individual-story editorial package",
    formats: ["Narrative", "Video"],
    channels: ["Website", "Video"],
    permitted: ["Website", "Video"],
    stage: "Review",
    status: "Needs review",
    lead: "Alex Morgan",
    reviewDue: "2026-10-23",
    releaseDate: "2026-11-03",
    rightsReference: "SF-4821",
    condition:
      "Rights cleared. Medical review required. Permitted use: web + video. No participant details in shared production material.",
    reviews: [
      { type: "Editorial", status: "Approved" },
      { type: "Medical", status: "Pending" },
      { type: "Rights", status: "Approved" },
      { type: "Final publisher", status: "Pending" },
    ],
    product: "Individual-story format",
    refs: [
      { tool: "salesforce", id: "SF-4821" },
      { tool: "planable", id: "PLN-2425" },
    ],
  }),
  p("PKG-108", "Rapid Coverage · Major Transport Disruption", {
    purpose: "Prepare a generic timely public information package",
    formats: ["Web update", "Social copy"],
    channels: ["Website", "Social"],
    permitted: ["Website", "Social"],
    stage: "Clearance",
    status: "Blocked",
    lead: "Taylor Brooks",
    reviewDue: "2026-10-20",
    releaseDate: "2026-10-22",
    embargo: "2026-10-21",
    condition:
      "Pre-release briefing remains protected until operational clearance; public outputs can be shared after approved release.",
    reviews: [
      { type: "Operational", status: "Pending" },
      { type: "Final publisher", status: "Pending" },
    ],
    refs: [
      { tool: "planable", id: "PLN-2428" },
      { tool: "brandwatch", id: "BW-121" },
    ],
  }),
  p("PKG-109", "Media Release Package", {
    purpose: "Prepare a public media announcement",
    formats: ["Media release"],
    channels: ["Website", "Email"],
    permitted: ["Website", "Email"],
    stage: "Scheduled",
    status: "Ready",
    embargo: "2026-10-25",
    releaseDate: "2026-10-26",
    condition:
      "Distribution information is embargoed until the approved release window.",
    reviews: [
      { type: "Editorial", status: "Approved" },
      { type: "Legal", status: "Approved" },
      { type: "Final publisher", status: "Approved" },
    ],
    refs: [
      { tool: "planable", id: "PLN-2430" },
      { tool: "brandwatch", id: "BW-127" },
    ],
  }),
  p("PKG-110", "Community Print Explainer", {
    purpose: "Adapt service information for a print audience",
    formats: ["Print", "Illustration", "Photography"],
    channels: ["Print"],
    permitted: ["Print"],
    stage: "Development",
    status: "Needs input",
    partner: "Rowan Creative Works",
    partnerType: "Creative agency",
    rights: "Restricted use",
    condition:
      "Selected imagery is cleared for print only; do not reuse in digital channels.",
    releaseDate: "2026-11-06",
    product: "Print explainer format",
    refs: [
      { tool: "affinity", id: "AF-110" },
      { tool: "notion", id: "NT-110" },
    ],
  }),
  p("PKG-111", "Audio Introduction Package", {
    purpose: "Produce an accessible audio introduction",
    formats: ["Audio"],
    channels: ["Audio", "Website"],
    permitted: ["Audio", "Website"],
    stage: "Briefing",
    status: "On track",
    partner: "Cedar Audio Collective",
    partnerType: "Freelance specialist",
    releaseDate: "2026-11-10",
    rights: "Pending confirmation",
    refs: [
      { tool: "asana", id: "AS-339" },
      { tool: "wistia", id: "WIS-130" },
    ],
  }),
  p("PKG-112", "Future Skills Week", {
    purpose: "Evaluate the completed Future Skills Week publishing series",
    formats: ["Social", "Graphics"],
    channels: ["Social"],
    permitted: ["Social"],
    stage: "Closed",
    status: "Delivered",
    rights: "Expired",
    condition:
      "Previous release completed. Asset rights have expired; no new publication permitted.",
    releaseDate: "2026-09-30",
    reviewDue: "2026-09-28",
    reviews: [
      { type: "Editorial", status: "Approved" },
      { type: "Final publisher", status: "Approved" },
    ],
    research: "/audience-innovation/decisions?initiative=EXP-205",
    product: "Social story package",
    refs: [
      { tool: "planable", id: "PLN-2390" },
      { tool: "piwik", id: "PA-198" },
    ],
  }),
];
packages.push(
  p("PKG-113", "City Innovation Summit", {
    purpose: "Coordinate the City Innovation Summit public-information series",
    formats: ["Web update", "Social copy", "Graphics"],
    channels: ["Website", "Social"],
    permitted: ["Website", "Social"],
    lead: "Alex Morgan",
    stage: "Development",
    reviewDue: "2026-10-23",
    releaseDate: "2026-10-30",
    condition:
      "Use the reviewed public-information copy and approved illustrations only.",
  }),
);
export const packagesById = new Map(packages.map((p) => [p.id, p]));
export interface ContentFile extends OperationalFile {
  packageId: string;
  area: string;
  workType: string;
  review: string;
  topic: string;
}
const f = (
  id: string,
  packageId: string,
  area: string,
  name: string,
  workType: string,
  review = "Working draft",
): ContentFile => {
  const pkg = packagesById.get(packageId)!;
  return {
    id,
    packageId,
    area,
    name,
    workType,
    review,
    topic: ["PKG-108", "PKG-113"].includes(packageId)
      ? "Cities & Mobility"
      : ["PKG-106", "PKG-111", "PKG-112"].includes(packageId)
        ? "Education & Skills"
        : ["PKG-104", "PKG-110"].includes(packageId)
          ? "Arts & Culture"
          : "Digital Society",
    library: "resources",
    folder: pkg.name,
    campaign: pkg.name,
    operation: "Shared operations",
    location: "Content production",
    type: name.split(".").at(-1)!,
    status: review === "Needs review" ? "In review" : "Draft",
    owner: pkg.lead,
    validFrom: "2026-10-01",
    validTo: "2026-12-31",
    modified: `2026-10-${String(3 + ([...id].reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % 14)).padStart(2, "0")}`,
    sensitivity: "Internal",
    recordState: "Working information",
  };
};
export const files: ContentFile[] = [
  f(
    "welcome-brief",
    "PKG-101",
    "editorial",
    "Customer Welcome — Creative Brief.docx",
    "Brief",
  ),
  f(
    "welcome-message",
    "PKG-101",
    "editorial",
    "Customer Welcome — Messaging Draft.docx",
    "Messaging",
    "Needs review",
  ),
  f(
    "welcome-visual",
    "PKG-101",
    "creative",
    "Customer Welcome — Visual Direction.pptx",
    "Creative concept",
  ),
  f(
    "welcome-adapt",
    "PKG-101",
    "channels",
    "Channel adaptation.xlsx",
    "Review",
  ),
  f(
    "landing-brief",
    "PKG-102",
    "editorial",
    "Landing Page — Content Brief.docx",
    "Brief",
  ),
  f(
    "landing-copy",
    "PKG-102",
    "editorial",
    "Page copy.docx",
    "Editorial draft",
    "Needs review",
  ),
  f(
    "landing-wireframe",
    "PKG-102",
    "digital",
    "Landing Page — Wireframe Review.pptx",
    "Review",
  ),
  f(
    "landing-release",
    "PKG-102",
    "digital",
    "Release checklist.docx",
    "Release checklist",
  ),
  f("video-brief", "PKG-103", "editorial", "Production brief.docx", "Brief"),
  f(
    "video-storyboard",
    "PKG-103",
    "creative",
    "Service Explainer — Storyboard.pptx",
    "Creative concept",
  ),
  f(
    "video-roughcut",
    "PKG-103",
    "creative",
    "Rough-cut review.docx",
    "Review",
    "Needs review",
  ),
  f(
    "video-delivery",
    "PKG-103",
    "channels",
    "Delivery checklist.docx",
    "Release checklist",
  ),
  f(
    "webinar-programme",
    "PKG-104",
    "editorial",
    "Programme brief.docx",
    "Brief",
  ),
  f(
    "webinar-speaker",
    "PKG-104",
    "editorial",
    "Community Webinar — Speaker Brief.docx",
    "Editorial draft",
    "Needs review",
  ),
  f(
    "webinar-registration",
    "PKG-104",
    "channels",
    "Registration copy.docx",
    "Editorial draft",
  ),
  f("webinar-run", "PKG-104", "channels", "Run-of-show.xlsx", "Review"),
  f("mobile-product", "PKG-105", "editorial", "Product brief.docx", "Brief"),
  f(
    "mobile-requirements",
    "PKG-105",
    "digital",
    "Content requirements.docx",
    "Content requirements",
  ),
  f(
    "mobile-wireframe",
    "PKG-105",
    "digital",
    "Wireframe review.pptx",
    "Review",
  ),
  f(
    "mobile-fields",
    "PKG-105",
    "digital",
    "Form Labels & Validation Copy.xlsx",
    "Content requirements",
  ),
  f(
    "mobile-acceptance",
    "PKG-105",
    "digital",
    "Acceptance checklist.docx",
    "Release checklist",
  ),
  f(
    "quarterly-draft",
    "PKG-106",
    "editorial",
    "Quarterly Audience Update — Editorial Draft.docx",
    "Editorial draft",
  ),
  f(
    "quarterly-display",
    "PKG-106",
    "creative",
    "Audience update display review.pptx",
    "Visual asset",
  ),
  f("story-brief", "PKG-107", "editorial", "Editorial brief.docx", "Brief"),
  f(
    "story-draft",
    "PKG-107",
    "editorial",
    "Draft narrative.docx",
    "Editorial draft",
  ),
  f(
    "story-concept",
    "PKG-107",
    "creative",
    "Creative concepts.pptx",
    "Creative concept",
  ),
  f("story-adapt", "PKG-107", "channels", "Channel adaptations.xlsx", "Review"),
  f(
    "rapid-copy",
    "PKG-108",
    "editorial",
    "Public information copy.docx",
    "Editorial draft",
  ),
  f(
    "rapid-clearance",
    "PKG-108",
    "channels",
    "Public release checklist.docx",
    "Release checklist",
  ),
  f(
    "media-copy",
    "PKG-109",
    "editorial",
    "Media release draft.docx",
    "Editorial draft",
  ),
  f("print-layout", "PKG-110", "creative", "Print layout review.pdf", "Review"),
  f(
    "print-selects",
    "PKG-110",
    "creative",
    "Photography selects.xlsx",
    "Visual asset",
  ),
  f(
    "audio-script",
    "PKG-111",
    "editorial",
    "Audio introduction script.docx",
    "Editorial draft",
  ),
  f(
    "social-evaluation",
    "PKG-112",
    "channels",
    "Future Skills Week — Evaluation.pptx",
    "Decision",
  ),
];
files.push(
  f(
    "coastal-brief",
    "PKG-108",
    "editorial",
    "Public information brief.docx",
    "Brief",
  ),
  f(
    "coastal-social",
    "PKG-108",
    "channels",
    "Social adaptations.docx",
    "Editorial draft",
    "Needs review",
  ),
  f(
    "coastal-web-review",
    "PKG-108",
    "digital",
    "Web accessibility review.xlsx",
    "Review",
  ),
  f(
    "water-brief",
    "PKG-113",
    "editorial",
    "City Innovation Summit — Content Brief.docx",
    "Brief",
  ),
  f(
    "water-copy",
    "PKG-113",
    "editorial",
    "Web and social working copy.docx",
    "Editorial draft",
    "Needs review",
  ),
  f(
    "water-visual",
    "PKG-113",
    "creative",
    "Illustration direction.pptx",
    "Creative concept",
  ),
  f(
    "water-release",
    "PKG-113",
    "channels",
    "Publishing checklist.xlsx",
    "Release checklist",
  ),
  f(
    "community-final",
    "PKG-112",
    "channels",
    "Future Skills Week — Published Copy.pdf",
    "Published output",
    "Published",
  ),
  f(
    "community-delivery",
    "PKG-112",
    "channels",
    "Publication register.xlsx",
    "Delivery record",
    "Closed",
  ),
);
for (const file of files.filter(
  (file) => file.packageId === "PKG-112" && file.id !== "social-evaluation",
))
  file.modified = "2026-09-30";
for (const pkg of packages)
  pkg.refs = pkg.refs.filter(
    (r) =>
      ![
        "github",
        "datadog",
        "staffbase",
        "openproject",
        "piwik",
        "vwo",
        "brandwatch",
        "semrush",
      ].includes(r.tool),
  );
export const filesById = new Map(files.map((f) => [f.id, f]));
export const partnerShares = [
  {
    packageId: "PKG-103",
    name: "External production collaboration",
    fileIds: [
      "video-brief",
      "video-storyboard",
      "video-roughcut",
      "video-delivery",
    ],
    note: "Production brief, storyboard, review comments and delivery milestones only.",
  },
  {
    packageId: "PKG-104",
    name: "Event-production collaboration",
    fileIds: ["webinar-programme", "webinar-speaker", "webinar-run"],
    note: "Programme and production working material only; no registration or personal records.",
  },
];
export const sharedFiles = (id: string) => {
  const share = partnerShares.find((s) => s.packageId === id);
  return share ? share.fileIds.map((id) => filesById.get(id)!) : [];
};
export const protectedTopics = [
  {
    packageId: "PKG-107",
    id: "participant-administration",
    name: "Participant administration",
  },
  {
    packageId: "PKG-108",
    id: "pre-release-briefing",
    name: "Pre-release operational briefing",
  },
  {
    packageId: "PKG-109",
    id: "embargoed-distribution",
    name: "Embargoed distribution information",
  },
  {
    packageId: "PKG-103",
    id: "commercial-proposal",
    name: "Commercial proposal",
  },
];
export const protectedHref = (p: (typeof protectedTopics)[number]) =>
  `/content-delivery/packages/${p.packageId}/protected/${p.id}`;
export const packageHref = (id: string) =>
  `/content-delivery/pipeline?package=${id}`;
export const fileHref = (f: ContentFile) =>
  `/content-delivery/${f.area}?file=${f.id}`;
export const toolHref = (id: string, packageId = "", reference = "") => {
  const platform = externalEnvironmentForTool(id);
  if (platform)
    return externalPreviewHref(
      platform.id,
      packageId ? packageHref(packageId) : "/content-delivery",
    );
  return (
    `/content-delivery/tools/${id}` +
    (packageId || reference
      ? "?" + new URLSearchParams({ package: packageId, reference })
      : "")
  );
};
export const pipelineViews = [
  "All Packages",
  "In Production",
  "Needs Review",
  "Ready for Delivery",
  "Publishing This Month",
  "Website & Digital",
  "Video & Visuals",
  "Live & Virtual",
  "External Partner Work",
  "Completed",
];
export function queryPackages(
  items: Package[],
  view: string,
  search = "",
  channel = "",
  format = "",
) {
  return items.filter(
    (p) =>
      matchesDisplayText(
        [p.name, p.purpose, p.lead, p.partner || ""].join("\n"),
        search,
      ) &&
      (!channel || p.channels.includes(channel)) &&
      (!format || p.formats.includes(format)) &&
      (view !== "In Production" || !["Live", "Closed"].includes(p.stage)) &&
      (view !== "Needs Review" || p.status === "Needs review") &&
      (view !== "Ready for Delivery" || p.status === "Ready") &&
      (view !== "Publishing This Month" ||
        p.releaseDate.startsWith("2026-10")) &&
      (view !== "Website & Digital" || p.channels.includes("Website")) &&
      (!["Video & Visuals", "Video & Multimedia"].includes(view) ||
        p.formats.some((f) =>
          ["Video", "Short video", "Audio", "Photography", "Graphics"].includes(
            f,
          ),
        )) &&
      (view !== "Live & Virtual" || p.channels.includes("Live / virtual")) &&
      (view !== "External Partner Work" || !!p.partner) &&
      (view !== "Completed" || ["Live", "Closed"].includes(p.stage)),
  );
}
export const stages = [
  "Briefing",
  "Development",
  "Creative production",
  "Review",
  "Clearance",
  "Ready for delivery",
  "Scheduled",
  "Live",
  "Closed",
];
export const rightsStatuses: Rights[] = [
  "Cleared",
  "Pending confirmation",
  "Restricted use",
  "Expired",
  "Do not publish",
];
export function releaseBlockers(p: Package, target: string) {
  if (!["Ready for delivery", "Scheduled", "Live"].includes(target)) return [];
  const blockers: string[] = [];
  if (!["Cleared", "Restricted use"].includes(p.rights))
    blockers.push(`Rights: ${p.rights}`);
  if (p.channels.some((c) => !p.permitted.includes(c)))
    blockers.push("A planned channel is outside permitted use");
  if (p.reviews.some((r) => r.status !== "Approved"))
    blockers.push("Required reviews are not all approved");
  if (target === "Live" && p.embargo && p.embargo > demoToday)
    blockers.push(`Embargo until ${p.embargo}`);
  if (target === "Scheduled" && p.embargo && p.releaseDate < p.embargo)
    blockers.push("Release date precedes the embargo");
  return blockers;
}
export function updateStage(p: Package, stage: string) {
  const blockers = releaseBlockers(p, stage);
  return {
    package: blockers.length
      ? p
      : {
          ...p,
          stage,
          status: ["Live", "Closed"].includes(stage)
            ? "Delivered"
            : ["Ready for delivery", "Scheduled"].includes(stage)
              ? "Ready"
              : stage === "Review" || stage === "Clearance"
                ? "Needs review"
                : "On track",
        },
    blockers,
  };
}
// Legacy channel-file shortcuts stay compatible; the full conversation model is in channels.ts.
export const teamChannels = [
  { id: "editorial", name: "Editorial Desk", areas: ["editorial"] },
  { id: "web", name: "Web Desk", areas: ["digital"] },
  { id: "social", name: "Social Desk", areas: ["channels"] },
  { id: "media", name: "Media Desk", areas: ["editorial"] },
  {
    id: "publications",
    name: "Publications & Email",
    areas: ["editorial", "creative", "channels"],
  },
  { id: "video", name: "Video & Visuals", areas: ["creative"] },
  {
    id: "coordination",
    name: "Production Coordination",
    areas: ["editorial", "creative", "channels", "digital"],
  },
];
export const filesForChannel = (id: string) =>
  files.filter((file) =>
    teamChannels
      .find((channel) => channel.id === id)
      ?.areas.includes(file.area),
  );
export function calendarEntries(items: Package[]) {
  return items
    .flatMap((p) => [
      {
        id: p.id + "-review",
        date: p.reviewDue,
        name: "Final approval / review",
        packageId: p.id,
      },
      {
        id: p.id + "-release",
        date: p.releaseDate,
        name: p.channels.includes("Website")
          ? "Content acceptance / publication"
          : "Go-live",
        packageId: p.id,
      },
    ])
    .concat([
      {
        id: "brief",
        date: "2026-10-19",
        name: "Brief due",
        packageId: "PKG-101",
      },
      {
        id: "creative",
        date: "2026-10-20",
        name: "Creative review",
        packageId: "PKG-101",
      },
      {
        id: "handoff",
        date: "2026-10-20",
        name: "External agency handoff",
        packageId: "PKG-103",
      },
      {
        id: "recording",
        date: "2026-10-22",
        name: "Recording date",
        packageId: "PKG-103",
      },
      {
        id: "postreview",
        date: "2026-10-30",
        name: "Post-release review",
        packageId: "PKG-102",
      },
    ])
    .sort((a, b) => a.date.localeCompare(b.date));
}
export const digitalSteps = [
  {
    name: "Audience need identified",
    file: "",
    research: "/audience-innovation/analytics?initiative=RD-103",
  },
  { name: "Content / product brief", file: "mobile-product" },
  { name: "Messaging and UX copy", file: "mobile-requirements" },
  { name: "Creative / design review", file: "mobile-wireframe" },
  {
    name: "Content requirements handoff",
    file: "mobile-fields",
    research: "/digital-tech/web-crm",
  },
  { name: "CMS content review", file: "", tool: "contentful" },
  { name: "QA / content acceptance", file: "mobile-acceptance" },
  {
    name: "Experiment where relevant",
    file: "",
    research: "/audience-innovation/experiments",
  },
  { name: "Release coordination", file: "", tool: "asana" },
  {
    name: "Post-release measurement",
    file: "",
    research: "/audience-innovation/analytics",
  },
];
export const recentIds = [
  "welcome-message",
  "video-storyboard",
  "landing-wireframe",
  "webinar-speaker",
];
