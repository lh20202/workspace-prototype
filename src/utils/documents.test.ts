import { describe, it, expect } from "vitest";
import { documents, currentCycle } from "../data/workspace";
import { queryDocuments, emptyFilters, canAccessRestricted } from "./documents";
describe("document discovery", () => {
  it("selects only the current cycle", () => {
    const result = queryDocuments(
      documents,
      "Current Planning Cycle",
      "",
      emptyFilters,
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((d) => d.cycle === currentCycle)).toBe(true);
  });
  it("includes both stages of review", () => {
    const result = queryDocuments(documents, "In Review", "", emptyFilters);
    expect(result.some((d) => d.status === "Ready for review")).toBe(true);
    expect(
      result.every((d) => ["In review", "Ready for review"].includes(d.status)),
    ).toBe(true);
  });
  it("combines search, metadata and folder scope", () => {
    const result = queryDocuments(
      documents,
      "All Documents",
      "SUBMISSION",
      { ...emptyFilters, area: "Operations", status: "Ready for review" },
      currentCycle,
    );
    expect(result.map((d) => d.name)).toEqual([
      "Operations submission 2027.xlsx",
    ]);
  });
  it("filters approved and orders grouped areas", () => {
    expect(
      queryDocuments(documents, "Approved", "", emptyFilters).every(
        (d) => d.status === "Approved",
      ),
    ).toBe(true);
    const result = queryDocuments(
      documents,
      "By Planning Area",
      "",
      emptyFilters,
    );
    expect(result.map((d) => d.area)).toEqual(
      result.map((d) => d.area).sort((a, b) => a.localeCompare(b)),
    );
  });
  it("limits restricted access to executive reviewers", () => {
    expect(canAccessRestricted("Workspace Member")).toBe(false);
    expect(canAccessRestricted("Planning Coordinator")).toBe(false);
    expect(canAccessRestricted("Executive Reviewer")).toBe(true);
  });
});

import { departments, quickLinks, currentUser } from "../data/workspace";
import { filtersFromParams } from "./documents";
describe("home shortcuts", () => {
  it.each(departments)("finds current-cycle submissions for %s", (area) => {
    const params = new URLSearchParams({ area, type: "Submission" });
    const result = queryDocuments(
      documents.filter((d) => d.library === "planning"),
      "All Documents",
      "",
      filtersFromParams(params),
      currentCycle,
    );
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every(
        (d) =>
          d.area === area &&
          d.type === "Submission" &&
          d.cycle === currentCycle,
      ),
    ).toBe(true);
  });
  it.each(quickLinks)("resolves $label to an accessible document", (link) => {
    const doc = documents.find((d) => d.name === link.name);
    expect(doc).toBeDefined();
    expect(doc?.library).not.toBe("restricted");
    expect(doc?.cycle).toBe(currentCycle);
  });
  it("always uses an ordinary contributor profile", () => {
    expect(currentUser.name).toBe("Maya Chen");
    expect(canAccessRestricted(currentUser.role)).toBe(false);
  });
  it("uses only the coherent department metadata", () => {
    expect(
      documents.every((d) =>
        ["Organisation-wide", ...departments].includes(d.area),
      ),
    ).toBe(true);
  });
});
