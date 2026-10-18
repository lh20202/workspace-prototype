import { rememberStaff, staff } from "../intranet/catalog";
import { teamsPreviewHrefForStaff } from "../teams/navigation";
import { isStandaloneDemo } from "../utils/demoMode";

const entryKey = "workspace-demo-welcome-entry";
const seenKey = "workspace-demo-controls-seen";
export const revealDemoControlsEvent = "workspace:reveal-demo-controls";
export const previewRoleChangingEvent = "workspace:preview-role-changing";

/** Only a first departure from Welcome invites the visitor to try the controls. */
export function markWelcomeEntry() {
  try {
    if (sessionStorage.getItem(seenKey) !== "1")
      sessionStorage.setItem(entryKey, "1");
  } catch {
    // The handle remains available when browser storage is disabled.
  }
}
export function consumeWelcomeEntry() {
  try {
    if (
      sessionStorage.getItem(entryKey) !== "1" ||
      sessionStorage.getItem(seenKey) === "1"
    )
      return false;
    sessionStorage.removeItem(entryKey);
    sessionStorage.setItem(seenKey, "1");
    return true;
  } catch {
    return false;
  }
}

export function changePreviewRole(nextId: string) {
  if (isStandaloneDemo()) return;
  const nextPerson = staff.find((member) => member.id === nextId);
  if (!nextPerson) return;
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event(previewRoleChangingEvent));
  rememberStaff(nextId);
  const teams =
    location.pathname === "/teams" ||
    location.pathname.includes("/teams") ||
    location.pathname.startsWith("/emergency-response");
  if (teams) {
    location.assign(
      teamsPreviewHrefForStaff(nextPerson, location.pathname, location.search),
    );
  } else {
    const next = new URL(location.href);
    next.searchParams.set("staff", nextId);
    next.searchParams.delete("preview");
    next.searchParams.delete("siteSettings");
    location.assign(`${next.pathname}${next.search}${next.hash}`);
  }
}
