import { withExplicitStaff } from "../utils/staffNavigation";
import type { SiteAdminModel } from "./model";
import type { SiteSurface } from "./SitePanels";

const pageSurfaces = [
  "contents",
  "usage",
  "advanced",
  "site-columns",
  "site-types",
  "navigation",
  "regional",
  "permissions",
] as const;
export function siteAdministrationPage(
  search: string,
): SiteSurface | undefined {
  const value = new URLSearchParams(search).get("siteSettings");
  return pageSurfaces.find((page) => page === value);
}
export function siteAdministrationHref(
  site: SiteAdminModel,
  surface: SiteSurface,
) {
  return withExplicitStaff(
    `${site.href}?siteSettings=${encodeURIComponent(surface)}`,
  );
}
