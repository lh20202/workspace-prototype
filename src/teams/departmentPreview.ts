import { departmentCodes, resolveDepartment } from "../coordination/data";
import { type PreviewRole } from "../access/policy";
import { resolveStaffPerson, selectedStaffId } from "../intranet/catalog";

/** Architecture opens an ordinary, route-scoped Department introduction. */
export function departmentPreviewHref(departmentId: string) {
  const department = resolveDepartment(departmentId);
  if (!department) return "/architecture";
  const currentRole = resolveStaffPerson(
    typeof location === "undefined"
      ? selectedStaffId()
      : new URLSearchParams(location.search).get("staff") || selectedStaffId(),
  );
  return `/teams?${new URLSearchParams({
    staff: currentRole.id,
    department: departmentCodes[department.id],
    departmentPreview: department.id,
    context: `department:${department.id}`,
    tab: "Posts",
  })}`;
}

export function readDepartmentPreview(search: string) {
  const params = new URLSearchParams(search);
  const context = params.get("context");
  if (context === "global") return undefined;
  return resolveDepartment(
    context?.startsWith("department:")
      ? context.slice("department:".length)
      : !context
        ? params.get("departmentPreview") ||
          params.get("department") ||
          params.get("division")
        : null,
  );
}

export function teamsPersonForSearch(search: string): PreviewRole {
  const params = new URLSearchParams(search);
  const role = resolveStaffPerson(params.get("staff"));
  const department = readDepartmentPreview(search);
  return department
    ? {
        ...role,
        departmentPreviewId: department.id,
      }
    : role;
}
