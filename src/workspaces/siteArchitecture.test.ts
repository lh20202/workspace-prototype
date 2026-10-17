import { describe, expect, it } from "vitest";
import { configById, functionalConfigs } from "./config";
import {
  functionalLibraries,
  functionalLibraryDocuments,
  libraryForFile,
} from "./siteArchitecture";
import {
  auditLibraryDefinition,
  auditLibraryFolders,
} from "../sharepoint/library";

describe("purposeful functional SharePoint information architecture", () => {
  it("separates service operations, supplier decisions and booking coordination without a primary Documents library", () => {
    expect(functionalLibraries.services.map((library) => library.name)).toEqual(
      [
        "Service Operations",
        "Purchasing & Suppliers",
        "Bookings & Coordination",
      ],
    );
    expect(functionalLibraries.services[0].aliases).toContain("documents");
    const config = configById.get("services")!;
    expect(libraryForFile(config, "services-F7")?.name).toBe(
      "Bookings & Coordination",
    );
    expect(libraryForFile(config, "services-F8")?.name).toBe(
      "Service Operations",
    );
    expect(libraryForFile(config, "services-F3")?.name).toBe(
      "Purchasing & Suppliers",
    );
  });
  it("keeps one public canonical file identity and a shallow path inside exactly one configured library", () => {
    for (const config of functionalConfigs) {
      for (const file of config.files) {
        const library = libraryForFile(config, file.id)!;
        expect(library, `${config.id}: ${file.name}`).toBeDefined();
        expect(
          functionalLibraryDocuments(
            config,
            library,
            file.area === "employee-representation" ? "skyler" : "riley",
          ).find((item) => item.id === file.id),
        ).toBe(file);
        expect(file.folder.split("/")).toHaveLength(2);
        expect(file.folder).toBe(file.folderPath);
        expect(library.areas).toContain(file.area);
      }
    }
  });
  it("uses valid library-specific columns, views and meaningful content types", () => {
    for (const config of functionalConfigs) {
      for (const library of functionalLibraries[config.id]) {
        expect(
          auditLibraryDefinition(
            library,
            functionalLibraryDocuments(config, library),
          ),
        ).toEqual([]);
        expect(library.columns).toHaveLength(5);
        expect(library.views!.length).toBeGreaterThanOrEqual(2);
        expect(library.views!.length).toBeLessThanOrEqual(4);
        expect(library.contentTypes?.length || 0).toBeLessThanOrEqual(3);
      }
    }
    expect(
      functionalLibraries.services[1].fields?.map((field) => field.key),
    ).not.toEqual(
      functionalLibraries.people[2].fields?.map((field) => field.key),
    );
  });
  it("varies related active folder populations and preserves deliberately small technical designs", () => {
    const reports = functionalConfigs.flatMap((config) =>
      functionalLibraries[config.id].flatMap((library) =>
        auditLibraryFolders(functionalLibraryDocuments(config, library)),
      ),
    );
    expect(new Set(reports.map((row) => row.count)).size).toBeGreaterThan(3);
    expect(reports.some((row) => row.count >= 4)).toBe(true);
    expect(reports.every((row) => row.count > 0 && row.count < 13)).toBe(true);
    expect(
      configById
        .get("digital")!
        .files.filter((file) => file.area === "systems-engineering"),
    ).toHaveLength(1);
  });
  it("does not add synthetic sensitive subjects or fake version filenames to ordinary files", () => {
    for (const config of functionalConfigs) {
      for (const file of config.files) {
        expect(
          config.protected.some(
            (subject) =>
              subject.id === file.id ||
              (subject.area === file.area && subject.area === "protected"),
          ),
        ).toBe(false);
        expect(file.name).not.toMatch(
          /\bv\d+\b|final final|salary|candidate assessment|employee contract|member list/i,
        );
      }
    }
    const reviewed = configById
      .get("services")!
      .files.find((file) => file.name === "Supplier Evaluation.xlsx")!;
    expect(reviewed.versions?.map((entry) => entry.version)).toEqual([
      "1.2",
      "1.1",
      "1.0",
    ]);
  });
});
