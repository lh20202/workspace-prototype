import {
  externalEnvironmentForTool,
  getExternalEnvironment,
  type ExternalEnvironment,
} from "./catalog";

// Established reference-system links keep their URLs; their old detailed simulations
// now use the same intentionally low-detail external boundary as fictional products.
const referenceSystems: Record<string, string> = {
  "website-analytics": "Website Analytics",
  performance: "Performance Analysis",
  github: "GitHub Enterprise",
  m365: "Microsoft 365",
  datadog: "Datadog",
  contentful: "Contentful",
  huggingface: "Hugging Face",
  piwik: "Piwik PRO",
  semrush: "Semrush",
  vwo: "VWO",
  brandwatch: "Brandwatch",
  cvent: "Cvent",
  webex: "Webex",
  openproject: "OpenProject",
  staffbase: "Staffbase",
  maintainx: "MaintainX",
  coupa: "Coupa",
  travelperk: "TravelPerk",
  envoy: "Envoy",
  safetyculture: "SafetyCulture",
  lucidchart: "Lucidchart",
  plana: "Plan A",
  archivesspace: "ArchivesSpace",
  preservica: "Preservica",
};

export function externalPreviewForPath(
  pathname: string,
): ExternalEnvironment | undefined {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "governance") return getExternalEnvironment("members");
  if (parts[0] === "frontline-sales")
    return getExternalEnvironment("frontline");
  if (parts[0] === "external") return getExternalEnvironment(parts[1] || "");
  const legacySystem =
    parts[1] === "systems" ||
    (parts[0] === "content-delivery" && parts[1] === "tools");
  if (!legacySystem || !parts[2]) return undefined;
  const id = parts[2];
  const canonical = externalEnvironmentForTool(id);
  if (canonical) return canonical;
  return referenceSystems[id]
    ? { id, name: referenceSystems[id], theme: "navy" }
    : undefined;
}

/** Return only to a same-site demo page, never another external preview or a loop. */
export function externalReturnHref(
  search: string,
  referrer = "",
  origin = "https://demo.invalid",
) {
  const requested = new URLSearchParams(search).get("returnTo");
  for (const candidate of [requested, referrer]) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate, origin);
      if (
        url.origin !== origin ||
        !url.pathname.startsWith("/") ||
        url.pathname.startsWith("//")
      )
        continue;
      if (
        url.pathname.startsWith("/external") ||
        externalPreviewForPath(url.pathname)
      )
        continue;
      return url.pathname + url.search + url.hash;
    } catch {
      /* A malformed return location falls back to the directory. */
    }
  }
  return "/architecture";
}

/** Use browser history only when this preview was opened from another local page. */
export function canReturnToReferrer(referrer: string, origin: string) {
  if (!referrer) return false;
  try {
    const url = new URL(referrer, origin);
    return (
      url.origin === origin &&
      !url.pathname.startsWith("/external") &&
      !externalPreviewForPath(url.pathname)
    );
  } catch {
    return false;
  }
}
