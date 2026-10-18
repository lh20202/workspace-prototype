import { demoMode } from "./demoMode";

/** Keep the colleague and demo entry choice without spreading route-specific state. */
export function withExplicitStaff(
  destination: string,
  search = typeof location === "undefined" ? "" : location.search,
) {
  const staff = new URLSearchParams(search).get("staff");
  const mode = demoMode(search);
  if (
    (!staff && !mode) ||
    !destination.startsWith("/") ||
    destination.startsWith("//")
  )
    return destination;
  const target = new URL(destination, "https://workspace.invalid");
  if (target.origin !== "https://workspace.invalid") return destination;
  let changed = false;
  if (staff && !target.searchParams.has("staff")) {
    target.searchParams.set("staff", staff);
    changed = true;
  }
  // Welcome offers a fresh choice; its two demo links explicitly choose their mode.
  if (mode && target.pathname !== "/" && !target.searchParams.has("demo")) {
    target.searchParams.set("demo", mode);
    changed = true;
  }
  if (!changed) return destination;
  return `${target.pathname}${target.search}${target.hash}`;
}
