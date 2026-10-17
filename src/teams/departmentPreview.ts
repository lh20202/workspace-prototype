import { departmentCodes, resolveDepartment } from "../coordination/data";
import { defaultPreviewRoleId, type PreviewRole } from "../access/policy";
import { resolveStaffPerson } from "../intranet/catalog";

/** Architecture opens an ordinary, route-scoped Department introduction. */
export function departmentPreviewHref(departmentId: string) {
  const department = resolveDepartment(departmentId);
  if (!department) return "/architecture";
  return `/teams?${new URLSearchParams({
    staff: defaultPreviewRoleId,
    department: departmentCodes[department.id],
    departmentPreview: department.id,
    tab: "Posts",
  })}`;
}

export function readDepartmentPreview(search: string) {
  const params = new URLSearchParams(search);
  const department = resolveDepartment(params.get("departmentPreview"));
  return params.get("staff") === defaultPreviewRoleId ? department : undefined;
}

export function teamsPersonForSearch(search: string): PreviewRole {
  const params = new URLSearchParams(search);
  const role = resolveStaffPerson(params.get("staff"));
  const department = readDepartmentPreview(search);
  return department
    ? {
        ...role,
        departmentId: department.id,
        unitId: "",
        departmentPreviewId: department.id,
      }
    : role;
}
