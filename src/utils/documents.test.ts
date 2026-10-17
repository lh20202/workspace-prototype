import { describe, it, expect } from "vitest";
import {
  documents,
  currentCycle,
  departmentSubmissionsFolder,
} from "../data/workspace";
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
      {
        ...emptyFilters,
        area: "EAO Department",
        status: "Ready for review",
      },
      currentCycle,
    );
    expect(result.map((d) => d.name)).toEqual([
      "Executive Office submission 2027.xlsx",
    ]);
  });
  it("filters approved and orders grouped areas", () => {
    expect(
      queryDocuments(documents, "Approved", "", emptyFilters).every(
        (d) => d.status === "Approved",
      ),
    ).toBe(true);
    const result = queryDocuments(documents, "By Department", "", emptyFilters);
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
  it("scopes the persistent department shortcut to the current submissions and retains their canonical objects", () => {
    const planning = documents.filter(
      (document) => document.library === "planning",
    );
    const result = queryDocuments(
      planning,
      "All Documents",
      "",
      emptyFilters,
      departmentSubmissionsFolder,
    );
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every(
        (document) =>
          document.type === "Submission" && document.cycle === currentCycle,
      ),
    ).toBe(true);
    expect(new Set(result.map((document) => document.id)).size).toBe(
      result.length,
    );
    for (const document of result)
      expect(documents.find((item) => item.id === document.id)).toBe(document);
    expect(
      childFolders(planning, departmentSubmissionsFolder)
        .map((folder) => folder.name)
        .sort(),
    ).toEqual([...departments].sort());
  });
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

import { childFolders, browseDocuments } from "./documents";
describe("folder browsing", () => {
  it("shows only cycle folders at the planning root", () => {
    const planning = documents.filter((d) => d.library === "planning");
    expect(childFolders(planning, "").map((f) => f.name)).toEqual([
      currentCycle,
      "2026 Mid-Year Review",
      "2026 Year-End Review",
    ]);
    expect(browseDocuments(planning, "")).toEqual([]);
    expect(browseDocuments(planning, currentCycle)).toEqual([]);
  });
  it("keeps current strategy and archives separate", () => {
    const strategy = documents.filter((d) => d.library === "strategy");
    expect(childFolders(strategy, "").map((f) => f.name)).toEqual([
      "Current strategy · 2025–2030",
      "Archive",
    ]);
    expect(
      childFolders(strategy, "Current strategy · 2025–2030").map((f) => f.name),
    ).toEqual([
      "Organisational strategy",
      "Annual strategy",
      "Multi-year strategy",
      "Department roadmaps",
    ]);
    const archived = queryDocuments(
      strategy,
      "All Documents",
      "",
      emptyFilters,
      "Archive",
    );
    expect(archived).toHaveLength(2);
    expect(archived.every((d) => d.status === "Superseded")).toBe(true);
  });
  it("keeps working sets shallow and varied without version-file filler", () => {
    const working = documents.filter((d) =>
      ["planning", "strategy", "reporting"].includes(d.library),
    );
    for (const folder of new Set(working.map((d) => d.folderPath)))
      expect(browseDocuments(working, folder).length).toBeLessThanOrEqual(8);
  });
  it("finds review material across child folders", () => {
    const planning = documents.filter((d) => d.library === "planning");
    expect(
      queryDocuments(
        planning,
        "In Review",
        "",
        emptyFilters,
        currentCycle,
      ).some((d) => d.name === "Consolidated organisational plan draft.docx"),
    ).toBe(true);
  });
});
