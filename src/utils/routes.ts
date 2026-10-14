export function planningPath(page: string) {
  return page === "home"
    ? "/planning"
    : `/planning/${page === "planning" ? "cycles" : page}`;
}
export function planningPage(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "planning")
    return parts[1] === "cycles" ? "planning" : (parts[1] ?? "home");
  return parts[0] ?? "home";
}
export function prototypeForPath(
  pathname: string,
): "launcher" | "planning" | "logistics" | "service-desk" {
  if (pathname === "/") return "launcher";
  if (pathname.startsWith("/service-desk/")) return "service-desk";
  return pathname.startsWith("/logistics") ? "logistics" : "planning";
}
export function pageTitle(pathname: string) {
  if (pathname.startsWith("/service-desk/"))
    return "Access request | Service Desk";
  if (pathname.startsWith("/logistics/teams"))
    return "Street & Telephone Campaign Logistics | Teams";
  if (pathname.startsWith("/logistics"))
    return "Street & Telephone Campaign Logistics";
  return pathname === "/"
    ? "Workspace prototypes"
    : "Organisational Planning & Reporting";
}
export function accessRequestHref(folder = "") {
  const path = [
    "Organisational Planning & Reporting",
    "Restricted Planning",
    folder,
  ]
    .filter(Boolean)
    .join(" / ");
  return (
    "/service-desk/access-request?" + new URLSearchParams({ location: path })
  );
}
