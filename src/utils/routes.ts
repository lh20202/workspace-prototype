import { environmentRegistry } from "../workspaces/registry";
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
):
  | "projects"
  | "launcher"
  | "architecture"
  | "planning"
  | "logistics"
  | "service-desk"
  | "services"
  | "audience"
  | "content"
  | "finance"
  | "teams"
  | "executive"
  | "governance"
  | "emergency"
  | "wiki"
  | "frontline"
  | "functional" {
  if (pathname === "/") return "launcher";
  if (pathname === "/architecture" || pathname === "/architecture/")
    return "architecture";
  if (
    pathname === "/sales-marketing/wiki" ||
    pathname.startsWith("/sales-marketing/wiki/")
  )
    return "wiki";
  if (
    pathname === "/frontline-sales" ||
    pathname.startsWith("/frontline-sales/")
  )
    return "frontline";
  if (pathname === "/projects" || pathname.startsWith("/projects/"))
    return "projects";
  if (
    [
      "/quality-monitoring",
      "/digital-tech",
      "/workspace-publishing",
      "/archives",
      "/legal-compliance",
      "/people-culture",
      "/employment-admin",
      "/customer-relations",
      "/employee-council",
      "/welfare-representation",
    ].some((base) => pathname === base || pathname.startsWith(base + "/"))
  )
    return "functional";
  if (pathname === "/executive" || pathname.startsWith("/executive/"))
    return "executive";
  if (pathname === "/governance" || pathname.startsWith("/governance/"))
    return "governance";
  if (
    pathname === "/emergency-response" ||
    pathname.startsWith("/emergency-response/")
  )
    return "emergency";
  if (pathname === "/teams") return "teams";
  if (
    pathname === "/financial-operations" ||
    pathname.startsWith("/financial-operations/")
  )
    return "finance";
  if (
    pathname === "/content-delivery" ||
    pathname.startsWith("/content-delivery/")
  )
    return "content";
  if (
    pathname === "/audience-innovation" ||
    pathname.startsWith("/audience-innovation/")
  )
    return "audience";
  if (pathname === "/services" || pathname.startsWith("/services/"))
    return "services";
  if (pathname.startsWith("/service-desk/")) return "service-desk";
  return pathname.startsWith("/logistics") ? "logistics" : "planning";
}
export function pageTitle(pathname: string) {
  if (pathname === "/") return "Digital workspace proof of concept";
  if (pathname.startsWith("/architecture"))
    return "Full Architecture Proof of Concept | Exploratory";
  if (pathname.startsWith("/logistics/teams"))
    return "Acquisition & Activation Logistics | Teams";
  const registered = environmentRegistry.find(
    (w) => pathname === w.href || pathname.startsWith(w.href + "/"),
  );
  if (registered) return registered.title;
  if (pathname.startsWith("/employee-council"))
    return "Welfare & Employee Representation";
  if (pathname.startsWith("/executive")) return "CEO & Executive Committee";
  if (pathname.startsWith("/governance")) return "Governance & Members Portal";
  if (pathname.startsWith("/emergency-response"))
    return "Emergency Response | Demo preview";
  if (pathname === "/teams") return "Digital workspaces | Teams";
  if (pathname.startsWith("/financial-operations"))
    return "Income & Financial Operations";
  if (
    pathname === "/content-delivery" ||
    pathname.startsWith("/content-delivery/")
  )
    return "Creative & Editorial Studio";
  if (
    pathname === "/audience-innovation" ||
    pathname.startsWith("/audience-innovation/")
  )
    return "Audience Research & Marketing Insight";
  if (pathname === "/services" || pathname.startsWith("/services/"))
    return "Staff Service Operations";
  if (pathname === "/service-desk/it-support")
    return "IT requests | Service Desk";
  if (pathname.startsWith("/service-desk/"))
    return "Access request | Service Desk";
  if (pathname.startsWith("/logistics/teams"))
    return "Acquisition & Activation Logistics | Teams";
  if (pathname.startsWith("/logistics"))
    return "Acquisition & Activation Logistics";
  return pathname === "/"
    ? "Digital Workspaces | Company intranet"
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
