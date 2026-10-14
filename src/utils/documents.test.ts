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
