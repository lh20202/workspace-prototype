/** Keep an explicitly selected colleague without spreading route-specific state. */
export function withExplicitStaff(
  destination: string,
  search = typeof location === "undefined" ? "" : location.search,
) {
  const staff = new URLSearchParams(search).get("staff");
  if (!staff || !destination.startsWith("/") || destination.startsWith("//"))
    return destination;
  const target = new URL(destination, "https://workspace.invalid");
  if (target.origin !== "https://workspace.invalid") return destination;
  if (target.searchParams.has("staff")) return destination;
  target.searchParams.set("staff", staff);
  return `${target.pathname}${target.search}${target.hash}`;
}
