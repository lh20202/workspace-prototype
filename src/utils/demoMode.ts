/** The entry choice is URL state, so refresh, history and new tabs keep it. */
export function demoMode(
  search = typeof location === "undefined" ? "" : location.search,
) {
  const mode = new URLSearchParams(search).get("demo");
  return mode === "standalone" || mode === "beta" ? mode : undefined;
}

export function isStandaloneDemo(search?: string) {
  return demoMode(search) === "standalone";
}
