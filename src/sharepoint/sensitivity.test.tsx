import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { documents as planning } from "../data/workspace";
import {
  files as logistics,
  filesById as logisticsById,
} from "../logistics/data";
import { files as audience } from "../audience/data";
import { files as content } from "../content/data";
import { files as finance } from "../finance/data";
import { files as executive } from "../executive/data";
import { initialIncidents } from "../executive/incidentData";
import { governanceRecords } from "../executive/governanceData";
import { functionalConfigs } from "../workspaces/config";
import {
  archiveRecords,
  legacyArchiveRecords,
} from "../workspaces/archiveData";
import { migratedPublishingFiles } from "../workspaces/publishing";
import { departments } from "../coordination/data";
import {
  allProjects,
  projectFiles,
  projectPortfolioFiles,
} from "../projects/data";
import { wikiFiles, wikiLibrary } from "../wiki/content";
import { ordinaryLibraryAuditSources } from "./contentAudit";
import { documentFor as audienceDocument } from "../audience/libraries";
import { documentFor as contentDocument } from "../content/libraries";
import { financialDocument } from "../finance/libraries";
import { executiveDocument } from "../executive/libraries";
import {
  functionalLibraryDocuments,
  functionalLibraries,
} from "../workspaces/siteArchitecture";
import { sensitivityLabels, isSensitivityLabel } from "./sensitivity";
import { documentProperties, libraryColumns, libraryValue } from "./library";
import SensitivityBadge from "./SensitivityBadge";

type LabelledFile = { id: string; name: string; sensitivity: unknown };
/** Complete synthetic file-store inventory, including controlled and archived files.
 * This is developer validation and is never used for staff discovery/access. */
const stores: Record<string, LabelledFile[]> = {
  Planning: planning,
  Logistics: logistics,
  Research: audience,
  Studio: content,
  Finance: finance,
  Executive: executive,
  Incidents: initialIncidents.flatMap((incident) => incident.files),
  Governance: governanceRecords,
  ArchiveCatalogue: archiveRecords,
  LegacyArchive: legacyArchiveRecords,
  ...Object.fromEntries(
    functionalConfigs.map((config) => [
      `Functional:${config.id}`,
      config.files,
    ]),
  ),
  Departments: departments.flatMap((department) => department.library),
  Units: departments.flatMap((department) =>
    department.units.flatMap((unit) => unit.files),
  ),
  Projects: allProjects.flatMap(projectFiles),
  Portfolio: [
    ...projectPortfolioFiles("control"),
    ...projectPortfolioFiles("support"),
  ],
  Wiki: wikiFiles,
};
const inventory = Object.values(stores).flat();

describe("canonical file sensitivity", () => {
  it("defines exactly the four shared file labels", () => {
    expect(sensitivityLabels).toEqual([
      "Public",
      "Internal",
      "Confidential",
      "Strictly confidential",
    ]);
    for (const invalid of [
      undefined,
      null,
      "",
      " ",
      "Restricted",
      "Internal only",
      "strictly confidential",
      "public",
    ]) {
      expect(isSensitivityLabel(invalid)).toBe(false);
    }
  });
  it.each(Object.keys(stores))(
    "requires a valid explicit label on every %s file",
    (store) => {
      expect(stores[store].length).toBeGreaterThan(0);
      for (const file of stores[store])
        expect(
          isSensitivityLabel(file.sensitivity),
          `${store}/${file.id}: ${String(file.sensitivity)}`,
        ).toBe(true);
    },
  );
  it("keeps Public to one or two genuinely released Sales outputs", () => {
    const publicFiles = inventory.filter(
      (file) => file.sensitivity === "Public",
    );
    expect(publicFiles.length).toBeGreaterThanOrEqual(1);
    expect(publicFiles.length).toBeLessThanOrEqual(2);
    for (const file of publicFiles) {
      const canonical = content.find((item) => item.id === file.id);
      expect(canonical).toBeDefined();
      expect(canonical?.review).toBe("Published");
      expect(canonical?.recordState).toBe("Final record");
      expect(canonical?.workType).toBe("Published output");
    }
    expect(
      inventory.filter((file) => file.sensitivity === "Internal").length,
    ).toBeGreaterThan(inventory.length / 2);
  });
  it("uses canonical labels in all library projections and Details", () => {
    for (const source of ordinaryLibraryAuditSources()) {
      for (const file of source.files) {
        const canonical = inventory.find((item) => item.id === file.id);
        expect(canonical, file.id).toBeDefined();
        expect(file.sensitivity, file.id).toBe(canonical?.sensitivity);
        expect(libraryValue(file, "sensitivity", source.definition)).toBe(
          file.sensitivity,
        );
        expect(
          Object.fromEntries(documentProperties(file, source.definition))
            .Sensitivity,
        ).toBe(file.sensitivity);
      }
      const columns = libraryColumns(source.definition);
      expect(
        columns.filter((column) => column.key === "sensitivity"),
      ).toHaveLength(1);
    }
  });
  it("never creates a Teams-specific classification for SharePoint-backed files", () => {
    for (const file of logistics)
      expect(logisticsById.get(file.id)?.sensitivity).toBe(file.sensitivity);
    for (const file of audience)
      expect(audienceDocument(file).sensitivity).toBe(file.sensitivity);
    for (const file of content)
      expect(contentDocument(file).sensitivity).toBe(file.sensitivity);
    for (const file of finance)
      expect(financialDocument(file).sensitivity).toBe(file.sensitivity);
    for (const file of executive)
      expect(executiveDocument(file).sensitivity).toBe(file.sensitivity);
    for (const config of functionalConfigs.filter(
      (config) => config.id !== "welfare",
    )) {
      for (const library of functionalLibraries[config.id]) {
        for (const file of functionalLibraryDocuments(config, library))
          expect(file).toBe(config.files.find((item) => item.id === file.id));
      }
    }
    for (const file of migratedPublishingFiles)
      expect(
        functionalConfigs
          .find((config) => config.id === "digital")
          ?.files.find((item) => item.id === file.id)?.sensitivity,
      ).toBe(file.sensitivity);
  });
  it("keeps the shared compact badge a property rather than an action or warning", () => {
    for (const value of sensitivityLabels) {
      const html = renderToStaticMarkup(
        createElement(SensitivityBadge, { value }),
      );
      expect(html).toContain(`Sensitivity: ${value}`);
      expect(html).toContain(value);
      expect(html).not.toMatch(/button|role="alert"/);
    }
    expect(wikiLibrary.defaultSensitivity).toBe("Internal");
  });
});
