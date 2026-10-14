import { describe, it, expect } from "vitest";
import {
  files,
  filesById,
  channels,
  posts,
  quickLinks,
  campaigns,
  permits,
  weekStart,
  weekEnd,
} from "./data";
import {
  queryFiles,
  emptyFilters,
  filesForChannel,
  queryPermits,
  fileHref,
} from "./query";
import { planningPath, planningPage, prototypeForPath } from "../utils/routes";
describe("one shared document model", () => {
  it("keeps identifiers unique", () =>
    expect(new Set(files.map((f) => f.id)).size).toBe(files.length));
  it("resolves every channel and post reference", () => {
    for (const ref of [
      ...channels.flatMap((c) => c.fileIds),
      ...posts.flatMap((p) => p.fileIds),
    ])
      expect(filesById.has(ref)).toBe(true);
  });
  it("returns the identical objects used by SharePoint", () => {
    const channel = channels.find((c) => c.id === "central-city")!;
    expect(
      filesForChannel(channel).find((f) => f.id === "central-deployment"),
    ).toBe(filesById.get("central-deployment"));
    expect(filesForChannel(channel).find((f) => f.id === "street-guide")).toBe(
      files.find((f) => f.id === "street-guide"),
    );
  });
  it.each(quickLinks)("resolves $label", (link) => {
    if (link.id) expect(filesById.has(link.id)).toBe(true);
    else expect(link.page).toBe("locations");
  });
  it.each(campaigns)("finds operational files for $name", (c) =>
    expect(
      queryFiles(
        files.filter((f) => f.library === "operations"),
        "All Documents",
        "",
        { ...emptyFilters, campaign: c.name },
      ).length,
    ).toBeGreaterThan(0),
  );
  it("generates SharePoint links to the same item", () => {
    const f = filesById.get("central-deployment")!;
    const url = new URL(fileHref(f), "https://example.test");
    expect(url.pathname).toBe("/logistics/operations");
    expect(url.searchParams.get("document")).toBe(f.id);
    expect(url.searchParams.get("folder")).toBe(f.folder);
  });
});
describe("operational views and lists", () => {
  it("filters street, telephone and travelling operations", () => {
    expect(
      queryFiles(files, "Telephone Operations", "", emptyFilters).every(
        (f) => f.operation === "Telephone",
      ),
    ).toBe(true);
    expect(
      queryFiles(files, "Street Operations", "", emptyFilters).every((f) =>
        f.operation.includes("street"),
      ),
    ).toBe(true);
    expect(
      queryFiles(files, "Travel Campaign", "", emptyFilters).every(
        (f) => f.operation === "Travelling street",
      ),
    ).toBe(true);
  });
  it("uses validity dates for this week and excludes drafts", () => {
    const result = queryFiles(files, "Current This Week", "", emptyFilters);
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every(
        (f) =>
          f.validFrom <= weekEnd &&
          f.validTo >= weekStart &&
          ["Current", "Active"].includes(f.status),
      ),
    ).toBe(true);
    expect(result.some((f) => f.id === "welcome-script")).toBe(false);
  });
  it("combines filters, folder and search", () => {
    expect(
      queryFiles(
        files,
        "All Documents",
        "DEPLOYMENT",
        { ...emptyFilters, campaign: "Central City Campaign" },
        "Central City Campaign",
      ).map((f) => f.id),
    ).toEqual(["central-deployment"]);
  });
  it("separates selected final records from working files", () => {
    const result = queryFiles(files, "Completed Campaigns", "", emptyFilters);
    expect(result).toHaveLength(3);
    expect(
      result.every(
        (f) => f.library === "records" && f.recordState === "Final record",
      ),
    ).toBe(true);
  });
  it("filters permit views and campaign metadata", () => {
    const pending = queryPermits(permits, "Awaiting Permits", "", "", "");
    expect(pending).toHaveLength(2);
    expect(pending.every((p) => p.permit === "Pending")).toBe(true);
    expect(
      queryPermits(
        permits,
        "All Locations",
        "station",
        "Central City Campaign",
        "Approved",
      ).map((p) => p.id),
    ).toEqual(["permit-central"]);
    expect(
      queryPermits(permits, "This Week", "", "", "").every(
        (p) => p.date >= weekStart && p.date <= weekEnd,
      ),
    ).toBe(true);
  });
});
describe("prototype routing", () => {
  it("distinguishes the launcher from workspace routes", () => {
    expect(prototypeForPath("/")).toBe("launcher");
    expect(prototypeForPath("/planning")).toBe("planning");
    expect(prototypeForPath("/logistics/teams")).toBe("logistics");
  });
  it("preserves planning library and home locations", () => {
    expect(planningPath("home")).toBe("/planning");
    expect(planningPath("planning")).toBe("/planning/cycles");
    expect(planningPage("/planning")).toBe("home");
    expect(planningPage("/planning/cycles")).toBe("planning");
    expect(planningPage("/planning/strategy")).toBe("strategy");
    expect(planningPage("/strategy")).toBe("strategy");
  });
});
