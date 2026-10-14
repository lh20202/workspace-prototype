import {
  currentCycle,
  type Document,
  type Role,
  type View,
} from "../data/workspace";
export interface Filters {
  cycle: string;
  type: string;
  area: string;
  status: string;
}
export const emptyFilters: Filters = {
  cycle: "",
  type: "",
  area: "",
  status: "",
};
export function canAccessRestricted(role: Role) {
  return role === "Executive Reviewer";
}
export function queryDocuments(
  docs: Document[],
  view: View,
  search: string,
  filters: Filters,
  folder = "",
  sort: keyof Document = "name",
  descending = false,
) {
  return docs
    .filter(
      (d) =>
        (!folder || d.cycle === folder) &&
        (view !== "Current Planning Cycle" || d.cycle === currentCycle) &&
        (view !== "In Review" ||
          ["In review", "Ready for review"].includes(d.status)) &&
        (view !== "Approved" || d.status === "Approved") &&
        d.name.toLowerCase().includes(search.trim().toLowerCase()) &&
        Object.entries(filters).every(
          ([key, value]) => !value || d[key as keyof Filters] === value,
        ),
    )
    .sort((a, b) => {
      const key = view === "By Planning Area" ? "area" : sort;
      return (
        String(a[key] ?? "").localeCompare(String(b[key] ?? "")) *
        (descending ? -1 : 1)
      );
    });
}

export function filtersFromParams(params: URLSearchParams): Filters {
  return {
    cycle: params.get("cycle") ?? "",
    type: params.get("type") ?? "",
    area: params.get("area") ?? "",
    status: params.get("status") ?? "",
  };
}
