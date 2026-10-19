import type { HubId } from "../workspaces/registry";

export type ExternalTheme = "navy" | "burgundy" | "teal" | "violet";
export type AdminHubId = HubId | "finance";
export interface ExternalEnvironment {
  id: string;
  name: string;
  theme: ExternalTheme;
  variant?: "frontline";
  logo?: string;
}
export interface AdminPlatform extends ExternalEnvironment {
  logo: string;
  category: string;
  purpose: string;
  hubs: AdminHubId[];
}

/** One identity per linked product, reused by every functional reference. */
export const adminPlatforms: AdminPlatform[] = [
  {
    id: "framevia",
    name: "VidPhotoEditor",
    logo: "/images/admin-logins/vidphotoeditor.svg",
    category: "Media & photo editing",
    purpose: "Create and edit production imagery and visual assets.",
    hubs: ["sales-marketing"],
    theme: "violet",
  },
  {
    id: "slotline",
    name: "MediaScheduler",
    logo: "/images/admin-logins/scheduler.svg",
    category: "Social content scheduling",
    purpose: "Plan, review and schedule social content.",
    hubs: ["sales-marketing"],
    theme: "burgundy",
  },
  {
    id: "relovia",
    name: "CRMsystem",
    logo: "/images/admin-logins/thecrm.svg",
    category: "Customer relationship management",
    purpose: "Maintain customer relationships and account context.",
    hubs: ["sales-marketing", "finance"],
    theme: "teal",
  },
  {
    id: "teralink",
    name: "TicketManager",
    logo: "/images/admin-logins/raiseticket.svg",
    category: "IT & service support",
    purpose: "Manage service requests, support and workplace technology.",
    hubs: ["infrastructure"],
    theme: "navy",
  },
  {
    id: "recorda",
    name: "InvoiceApprover",
    logo: "/images/admin-logins/invoicer.svg",
    category: "Invoice & document workflow",
    purpose: "Route documents and invoices through review and approval.",
    hubs: ["infrastructure"],
    theme: "burgundy",
  },
  {
    id: "pathory",
    name: "PMtool",
    logo: "/images/admin-logins/pmtool.svg",
    category: "Project management",
    purpose: "Coordinate project tasks, milestones and delivery.",
    hubs: ["infrastructure"],
    theme: "teal",
  },
  {
    id: "metriva",
    name: "DataAnalytica",
    logo: "/images/admin-logins/datahub.svg",
    category: "Data analytics & reporting",
    purpose: "Explore data, monitor performance and build analytical reports.",
    hubs: ["sales-marketing", "infrastructure", "finance"],
    theme: "navy",
  },
  {
    id: "peopleharbour",
    name: "HRSystem",
    logo: "/images/admin-logins/hrsystem.svg",
    category: "HR & people administration",
    purpose: "Administer employee records and recruitment processes.",
    hubs: ["personnel"],
    theme: "violet",
  },
  {
    id: "velora",
    name: "MoneyManager",
    logo: "/images/admin-logins/moneytool.svg",
    category: "Financial administration",
    purpose: "Manage accounting, financial planning and treasury records.",
    hubs: ["finance"],
    theme: "navy",
  },
];
export const adminPlatformById = new Map(
  adminPlatforms.map((platform) => [platform.id, platform]),
);
export function adminPlatformsForHub(hub: AdminHubId) {
  return adminPlatforms.filter((platform) => platform.hubs.includes(hub));
}
export const externalEnvironments: ExternalEnvironment[] = [
  {
    id: "frontline",
    name: "Local Crew Portal",
    theme: "teal",
    variant: "frontline",
  },
  { id: "taskforce", name: "Global Crew Portal", theme: "navy" },
  {
    id: "members",
    name: "Membership Portal",
    theme: "burgundy",
  },
  { id: "city-health", name: "City Health Unit", theme: "teal" },
  { id: "media-library", name: "Media Library", theme: "violet" },
];
export const externalEnvironmentById = new Map(
  externalEnvironments.map((environment) => [environment.id, environment]),
);
export function getExternalEnvironment(
  id: string,
): ExternalEnvironment | undefined {
  return externalEnvironmentById.get(id) || adminPlatformById.get(id);
}
export function externalPreviewHref(id: string, returnTo?: string) {
  const base = `/external/${id}`;
  return returnTo ? `${base}?returnTo=${encodeURIComponent(returnTo)}` : base;
}

/** Existing file/system IDs stay stable; these aliases only consolidate product identity. */
export const externalToolAliases: Record<string, string> = {
  salesforce: "relovia",
  hubspot: "relovia",
  gainsight: "relovia",
  quorum: "relovia",
  zendesk: "relovia",
  planable: "slotline",
  affinity: "framevia",
  wistia: "framevia",
  asana: "pathory",
  notion: "pathory",
  freshservice: "teralink",
  jira: "teralink",
  workday: "peopleharbour",
  greenhouse: "peopleharbour",
  recruitment: "peopleharbour",
  netsuite: "velora",
  "business-central": "velora",
  blackline: "velora",
  adaptive: "velora",
  kyriba: "velora",
  tableau: "velora",
  stripe: "velora",
  "m-files": "recorda",
  docuware: "recorda",
  docusign: "recorda",
};
export function externalEnvironmentForTool(id: string | undefined) {
  if (!id) return undefined;
  return adminPlatformById.get(externalToolAliases[id] || id);
}

const legacyBrandPatterns: [RegExp, string][] = [
  // Previously displayed names can still appear in saved demo content.
  [/\bFramevia\b/g, "framevia"],
  [/\bSlotline\b/g, "slotline"],
  [/\bRelovia\b/g, "relovia"],
  [/\bMetriva\b|\bDataHub\b/g, "metriva"],
  [/\bTeralink\b/g, "teralink"],
  [/\bRecorda\b/g, "recorda"],
  [/\bPathory\b/g, "pathory"],
  [/\bVelora\b/g, "velora"],
  [/\bPeopleHarbour\b/g, "peopleharbour"],
  [
    /\bSalesforce(?: Sales Cloud| Platform)?\b|\bHubSpot(?: CRM)?\b|\bGainsight\b|\bQuorum\b|\bZendesk\b/g,
    "relovia",
  ],
  [/\bPlanable\b/g, "slotline"],
  [/\bAffinity\b|\bWistia\b/g, "framevia"],
  [/\bAsana\b|\bNotion\b/g, "pathory"],
  [/\bFreshservice\b|\bJira\b/g, "teralink"],
  [/\bWorkday(?: HCM)?\b|\bGreenhouse(?: Recruiting)?\b/g, "peopleharbour"],
  [
    /\bOracle NetSuite\b|\bNetSuite\b|\bBlackLine\b|\bAdaptive Planning\b|\bKyriba\b|\bTableau\b|\bStripe\b/g,
    "velora",
  ],
  [/\bM-Files\b|\bDocuWare\b|\bDocuSign\b/g, "recorda"],
];
/** Apply after interpretation/translation: only visible legacy brand names change, never stored records. */
export function canonicalBrandText(text: string): string {
  // Workday Adaptive Planning is a financial product rather than the people platform.
  let display = text.replace(
    /\bWorkday Adaptive Planning\b/g,
    adminPlatformById.get("velora")!.name,
  );
  for (const [pattern, id] of legacyBrandPatterns)
    display = display.replace(pattern, adminPlatformById.get(id)!.name);
  return display;
}
