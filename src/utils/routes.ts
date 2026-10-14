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
export function prototypeForPath(pathname: string) {
  return pathname === "/"
    ? "launcher"
    : pathname.startsWith("/logistics")
      ? "logistics"
      : "planning";
}
