import { peopleDirectory, recordContacts } from "../intranet/catalog";
import { departments } from "../coordination/data";
import { environmentById, environmentRegistry } from "../workspaces/registry";

export interface AccessContext {
  workspaceId: string;
  area: string;
  location?: string;
  personId?: string;
  department?: string;
  project?: string;
  returnHref?: string;
}
export interface AccessFocalPoint {
  id: string;
  name: string;
  role: string;
}
const focalPeople: Record<string, string> = {
  logistics: "maya",
  audience: "taylor",
  content: "alex",
  customer: "maya",
  finance: "sam",
  services: "jordan",
  quality: "casey",
  digital: "devon",
  legal: "harper",
  people: "elena",
  employment: "jamie",
  welfare: "riley",
  executive: "robin",
  archives: "morgan",
  projects: "casey",
  governance: "robin",
  publishing: "devon",
  "sales-wiki": "taylor",
};
/** A business contact, deliberately not an additional selectable preview identity. */
export const frontlineSalesFocalPoint: AccessFocalPoint = {
  id: "frontline-coordinator",
  name: "Noor Bennett",
  role: "Frontline Sales Coordinator",
};
export function isSalesAccessContext(
  context: Pick<AccessContext, "workspaceId">,
) {
  const destination = environmentById.get(context.workspaceId);
  return (
    destination?.hubId === "sales-marketing" &&
    destination.environmentType !== "portal"
  );
}
const specialContacts: Record<string, AccessFocalPoint> = {
  "frontline-sales": frontlineSalesFocalPoint,
  planning: {
    id: "planning-coordinator",
    name: "Jordan Ellis",
    role: "Planning Coordinator",
  },
  emergency: {
    id: "response-coordinator",
    name: "Drew Ellis",
    role: "Response Coordinator",
  },
  council: {
    id: "skyler",
    name: "Skyler Lane",
    role: "Independent Employee Representative",
  },
};
const specialWorkspaces: Record<string, { title: string; href: string }> = {
  governance: {
    title: "Executive Committee Members portal",
    href: "/governance",
  },
  emergency: { title: "Emergency Response", href: "/emergency-response" },
};
export function accessWorkspace(
  context: Pick<AccessContext, "workspaceId" | "department">,
) {
  const department = departments.find((item) => item.id === context.department);
  if (department)
    return {
      title: department.name,
      href: `/teams?department=${department.id}`,
    };
  return (
    environmentById.get(
      context.workspaceId === "council" ? "welfare" : context.workspaceId,
    ) ||
    specialWorkspaces[context.workspaceId] || {
      title: "Digital workspaces",
      href: "/architecture",
    }
  );
}
export function accessFocalPoint(
  context: Pick<AccessContext, "workspaceId" | "department" | "personId"> &
    Partial<Pick<AccessContext, "area">>,
): AccessFocalPoint {
  const department = departments.find((item) => item.id === context.department);
  if (department)
    return {
      id: department.id,
      name: department.coordinator.name,
      role: department.coordinator.role,
    };
  if (
    context.workspaceId === "welfare" &&
    /^(Employee Representation|Independent representative|Council participation)/i.test(
      context.area || "",
    )
  )
    return specialContacts.council;
  const special = specialContacts[context.workspaceId];
  if (special) return special;
  const person =
    peopleDirectory.find(
      (item) => item.id === focalPeople[context.workspaceId],
    ) ||
    recordContacts.find(
      (item) => item.id === focalPeople[context.workspaceId],
    ) ||
    recordContacts[0];
  if (context.personId === person.id && "departmentId" in person) {
    const alternate = departments.find(
      (item) => item.id === person.departmentId,
    );
    if (alternate)
      return {
        id: `alternate-${alternate.id}`,
        name: alternate.coordinator.name,
        role: alternate.coordinator.role,
      };
  }
  return { id: person.id, name: person.name, role: person.role };
}
export function safeAccessReturn(
  value: string | null | undefined,
  fallback: string,
) {
  return value?.startsWith("/") &&
    !value.startsWith("//") &&
    !/[\\\t\r\n]/.test(value)
    ? value
    : fallback;
}
export function accessWorkspaceId(
  value: string | null,
  explicit?: string | null,
) {
  if (explicit === "council" || value === "Employee Representative Council")
    return "welfare";
  // Preserve saved access-request links after the visible service-site rename.
  if (
    !explicit &&
    ["Organisation Services", "Organisation Services workspace"].includes(
      value || "",
    )
  )
    return "services";
  if (
    explicit &&
    (environmentById.has(explicit) ||
      specialWorkspaces[explicit] ||
      explicit === "department")
  )
    return explicit;
  const workspace = environmentRegistry.find(
    (item) => item.id === value || item.title === value,
  );
  if (workspace) return workspace.id;
  if (
    [
      "Content Room",
      "Content Creation & Delivery",
      "Creative & Editorial Studio",
    ].includes(value || "")
  )
    return "content";
  return (
    Object.entries(specialWorkspaces).find(
      ([, item]) => item.title === value,
    )?.[0] || "planning"
  );
}
export function urgentAccessHref(context: AccessContext) {
  const workspace = accessWorkspace(context);
  const focal = accessFocalPoint(context);
  const params = new URLSearchParams({
    urgency: "urgent",
    workspaceId: context.workspaceId,
    workspace: workspace.title,
    area: context.area,
    location: context.location || `${workspace.title} / ${context.area}`,
    focalPoint: focal.id,
    reason: `Access to ${context.area} is time-sensitive and the workspace focal point is unavailable.`,
    returnTo: safeAccessReturn(context.returnHref, workspace.href),
  });
  if (context.personId) params.set("person", context.personId);
  if (context.department) params.set("department", context.department);
  if (context.project) params.set("project", context.project);
  return `/service-desk/access-request?${params}`;
}
