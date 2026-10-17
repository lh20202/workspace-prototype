import { describe, expect, it } from "vitest";
import { matchesDisplayText } from "./search";
import { translateText } from "./translate";
import { queryLibrary, type LibraryDocument } from "../sharepoint/library";
import {
  queryDocuments,
  emptyFilters as planningFilters,
} from "../utils/documents";
import { documents } from "../data/workspace";
import {
  queryFiles as logisticsQuery,
  emptyFilters as logisticsFilters,
} from "../logistics/query";
import { files as logisticsFiles } from "../logistics/data";
import { queryInitiatives, initiatives } from "../audience/data";
import { queryPackages, packages } from "../content/data";
import { searchArchive, archiveRecords } from "../workspaces/archiveData";
import {
  departments,
  accessibleFiles,
  searchCoordination,
} from "../coordination/data";
import { staff } from "../intranet/catalog";

describe("search matches the same canonical records in English and German", () => {
  it("matches translated filenames, statuses, workspace labels and named folder chunks", () => {
    expect(
      matchesDisplayText(
        "Customer Welcome — Creative Brief.docx",
        "Kreativbriefing",
      ),
    ).toBe(true);
    expect(
      matchesDisplayText(
        "Customer Welcome — Creative Brief.docx",
        "Creative Brief",
      ),
    ).toBe(true);
    expect(matchesDisplayText("Approved", "genehmigt")).toBe(true);
    expect(
      matchesDisplayText(
        "Organisational Planning & Reporting",
        "Organisationsplanung",
      ),
    ).toBe(true);
    expect(
      matchesDisplayText("Planning & Analysis/2026", "Planung und Analyse"),
    ).toBe(true);
    expect(
      matchesDisplayText(
        "Maya Chen\nApproved\nPlanning & Analysis",
        "  GENEHMIGT   Planung und Analyse ",
      ),
    ).toBe(true);
    expect(
      matchesDisplayText("Staff Service Operations", "Interne Serviceprozesse"),
    ).toBe(true);
    expect(
      matchesDisplayText(
        "Welfare & Employee Representation",
        "Personalvertretung",
      ),
    ).toBe(true);
    expect(matchesDisplayText("Personnel", "Personal")).toBe(true);
    expect(matchesDisplayText("PRJ-2026-014", "PRJ-2026-014")).toBe(true);
    expect(matchesDisplayText("Approved", " ")).toBe(true);
    expect(matchesDisplayText("Draft", "Genehmigt")).toBe(false);
  });
  it("searches each permitted library field before concatenation without changing IDs, status filters or folders", () => {
    const permitted: LibraryDocument[] = [
      {
        id: "working",
        name: "Customer Welcome — Creative Brief.docx",
        folder: "Planning & Analysis/2026",
        status: "In review",
        metadata: { Workspace: "Organisational Planning & Reporting" },
      },
      {
        id: "approved",
        name: "Release checklist.xlsx",
        folder: "Planning & Analysis/2026",
        status: "Approved",
      },
    ];
    const before = JSON.stringify(permitted);
    expect(
      queryLibrary(permitted, { folder: "", search: "Kreativbriefing" }).map(
        (file) => file.id,
      ),
    ).toEqual(["working"]);
    expect(
      queryLibrary(permitted, { folder: "", search: "In Prüfung" }).map(
        (file) => file.id,
      ),
    ).toEqual(["working"]);
    expect(
      queryLibrary(permitted, {
        folder: "",
        search: "Organisationsplanung",
      }).map((file) => file.id),
    ).toEqual(["working"]);
    expect(
      queryLibrary(permitted, {
        folder: "",
        search: "Genehmigt",
        status: "Approved",
      }).map((file) => file.id),
    ).toEqual(["approved"]);
    expect(
      queryLibrary(permitted, {
        folder: "Elsewhere",
        search: "Kreativbriefing",
      }),
    ).toEqual([]);
    expect(
      queryLibrary(permitted, {
        folder: "",
        search: "Kreativbriefing",
        status: "Approved",
      }),
    ).toEqual([]);
    expect(JSON.stringify(permitted)).toBe(before);
  });
  it("keeps the planning query's supplied visibility scope while accepting displayed status text", () => {
    const visible = documents.filter((file) => file.library !== "restricted");
    const english = queryDocuments(
      visible,
      "All Documents",
      "In review",
      planningFilters,
    ).map((file) => file.id);
    expect(english.length).toBeGreaterThan(0);
    expect(
      queryDocuments(
        visible,
        "All Documents",
        "In Prüfung",
        planningFilters,
      ).map((file) => file.id),
    ).toEqual(english);
    expect(
      queryDocuments(
        visible,
        "All Documents",
        "Genehmigt",
        planningFilters,
      ).every((file) => file.library !== "restricted"),
    ).toBe(true);
  });
  it("reuses the display matcher in logistics, audience, Studio and archive query owners", () => {
    const logistics = {
      ...logisticsFiles[0],
      name: "Planning guidance 2027.docx",
    };
    expect(
      logisticsQuery(
        [logistics],
        "All Documents",
        translateText(logistics.name, "de"),
        logisticsFilters,
      ),
    ).toEqual([logistics]);
    const initiative = initiatives.find(
      (item) => translateText(item.name, "de") !== item.name,
    )!;
    expect(initiative).toBeDefined();
    expect(
      queryInitiatives(
        [initiative],
        "All Initiatives",
        translateText(initiative.name, "de"),
      ),
    ).toEqual([initiative]);
    const packageItem = packages.find(
      (item) => translateText(item.name, "de") !== item.name,
    )!;
    expect(packageItem).toBeDefined();
    expect(
      queryPackages(
        [packageItem],
        "All Packages",
        translateText(packageItem.name, "de"),
      ),
    ).toEqual([packageItem]);
    const record = archiveRecords.find(
      (item) => item.creator === "Project Control",
    )!;
    expect(record).toBeDefined();
    expect(
      searchArchive("Projektsteuerung", {}).map((item) => item.id),
    ).toContain(record.id);
  });
  it("never broadens department or unit access when a German query matches a denied record", () => {
    const maya = staff.find((person) => person.id === "maya")!;
    const finance = departments.find(
      (department) => department.id === "finance-services",
    )!;
    expect(searchCoordination(finance, maya, "Besprechung")).toEqual({
      files: [],
      posts: [],
    });
    const ownDepartment = departments.find(
      (department) => department.id === maya.departmentId,
    )!;
    const allowed = new Set(
      accessibleFiles(ownDepartment, maya).map((file) => file.id),
    );
    for (const unit of ownDepartment.units)
      for (const file of unit.files)
        if (!allowed.has(file.id))
          expect(
            searchCoordination(
              ownDepartment,
              maya,
              translateText(file.name, "de"),
            ).files.some((result) => result.id === file.id),
          ).toBe(false);
  });
});
