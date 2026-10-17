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
    name: "Framevia",
    logo: "/images/admin-logins/framevia.svg",
    category: "Media & photo editing",
    purpose: "Create and edit production imagery and visual assets.",
    hubs: ["sales-marketing"],
    theme: "violet",
  },
  {
    id: "slotline",
    name: "Slotline",
    logo: "/images/admin-logins/slotline.svg",
    category: "Social content scheduling",
    purpose: "Plan, review and schedule social content.",
    hubs: ["sales-marketing"],
    theme: "burgundy",
  },
  {
    id: "relovia",
    name: "Relovia",
    logo: "/images/admin-logins/relovia.svg",
    category: "Customer relationship management",
    purpose: "Maintain customer relationships and account context.",
    hubs: ["sales-marketing", "finance"],
    theme: "teal",
  },
  {
    id: "teralink",
    name: "Teralink",
    logo: "/images/admin-logins/teralink.svg",
    category: "IT & service support",
    purpose: "Manage service requests, support and workplace technology.",
    hubs: ["infrastructure"],
    theme: "navy",
  },
  {
    id: "recorda",
    name: "Recorda",
    logo: "/images/admin-logins/recorda.svg",
    category: "Invoice & document workflow",
    purpose: "Route documents and invoices through review and approval.",
    hubs: ["infrastructure"],
    theme: "burgundy",
  },
  {
    id: "pathory",
    name: "Pathory",
    logo: "/images/admin-logins/pathory.svg",
    category: "Project management",
    purpose: "Coordinate project tasks, milestones and delivery.",
    hubs: ["infrastructure"],
    theme: "teal",
  },
  {
    id: "peopleharbour",
    name: "PeopleHarbour",
    logo: "/images/admin-logins/peopleharbour.svg",
    category: "HR & people administration",
    purpose: "Administer employee records and recruitment processes.",
    hubs: ["personnel"],
    theme: "violet",
  },
  {
    id: "velora",
    name: "Velora",
    logo: "/images/admin-logins/velora.svg",
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
    name: "Frontline Crew Portal",
    theme: "teal",
    variant: "frontline",
  },
  { id: "taskforce", name: "International Taskforce Portal", theme: "navy" },
  { id: "members", name: "Members Portal", theme: "burgundy" },
  { id: "city-health", name: "City Health Unit", theme: "teal" },
  { id: "media-library", name: "Global Media Library", theme: "violet" },
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
