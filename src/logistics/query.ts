import {
  filesById,
  weekStart,
  weekEnd,
  type OperationalFile,
  type Channel,
  type Permit,
} from "./data";
export const savedViews = [
  "All Documents",
  "Current Campaigns",
  "In-person Operations",
  "Calling Operations",
  "Travel Campaign",
  "Current This Week",
  "Completed Campaigns",
] as const;
export type SavedView = (typeof savedViews)[number];
export interface FileFilters {
  campaign: string;
  operation: string;
  type: string;
  status: string;
}
export const emptyFilters: FileFilters = {
  campaign: "",
  operation: "",
  type: "",
  status: "",
};
export function queryFiles(
  items: OperationalFile[],
  view: SavedView,
  search: string,
  filters: FileFilters,
  folder = "",
  sort: keyof OperationalFile = "name",
  descending = false,
) {
  return items
    .filter(
      (f) =>
        (!folder || f.folder === folder) &&
        f.name.toLowerCase().includes(search.trim().toLowerCase()) &&
        Object.entries(filters).every(
          ([k, v]) => !v || f[k as keyof FileFilters] === v,
        ) &&
        (view !== "Current Campaigns" ||
          ["Current", "Active", "In review"].includes(f.status)) &&
        (view !== "In-person Operations" ||
          ["Local in-person", "Travelling in-person"].includes(f.operation)) &&
        (view !== "Calling Operations" || f.operation === "Calling") &&
        (view !== "Travel Campaign" || f.operation === "Travelling in-person") &&
        (view !== "Current This Week" ||
          (f.validFrom <= weekEnd &&
            f.validTo >= weekStart &&
            ["Current", "Active"].includes(f.status))) &&
        (view !== "Completed Campaigns" || f.status === "Completed"),
    )
    .sort((a, b) => a[sort].localeCompare(b[sort]) * (descending ? -1 : 1));
}
export function filesForChannel(channel: Channel) {
  return channel.fileIds
    .map((id) => filesById.get(id))
    .filter((f): f is OperationalFile => !!f);
}
export const locationViews = [
  "All Locations",
  "This Week",
  "Awaiting Permits",
  "Confirmed",
] as const;
export function queryPermits(
  rows: Permit[],
  view: string,
  search: string,
  campaign: string,
  permit: string,
) {
  return rows
    .filter(
      (r) =>
        (!campaign || r.campaign === campaign) &&
        (!permit || r.permit === permit) &&
        `${r.location} ${r.region} ${r.notes}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()) &&
        (view !== "This Week" || (r.date >= weekStart && r.date <= weekEnd)) &&
        (view !== "Awaiting Permits" || r.permit === "Pending") &&
        (view !== "Confirmed" || r.status === "Confirmed"),
    )
    .sort((a, b) => a.date.localeCompare(b.date));
}
export function fileHref(file: OperationalFile) {
  const params = new URLSearchParams({ document: file.id });
  if (file.folder) params.set("folder", file.folder);
  return `/logistics/${file.library}?${params}`;
}
