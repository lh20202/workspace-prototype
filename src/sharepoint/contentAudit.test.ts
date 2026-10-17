import { describe, expect, it } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { documents as planningFiles } from "../data/workspace";
import {
  files as executiveFiles,
  visibleFiles as visibleExecutiveFiles,
} from "../executive/data";
import { files as financialFiles, protectedSubjects } from "../finance/data";
import { functionalConfigs } from "../workspaces/config";
import {
  functionalLibraries,
  functionalLibraryDocuments,
} from "../workspaces/siteArchitecture";
import {
  auditLibraryDefinition,
  auditLibraryFolders,
  libraryFields,
  queryLibrary,
} from "./library";
import {
  libraryContentAudit,
  libraryContentAuditMarkdown,
  ordinaryLibraryAuditSources,
} from "./contentAudit";

const sources = ordinaryLibraryAuditSources();
const configured = sources.filter((source) => !!source.definition);
if (process.env.CONTENT_AUDIT_REPORT === "1") {
  mkdirSync("docs", { recursive: true });
  writeFileSync("docs/content-audit.md", libraryContentAuditMarkdown());
}

// Run CONTENT_AUDIT=1 node node_modules/vitest/vitest.mjs run
// src/sharepoint/contentAudit.test.ts --silent=false --reporter=default
// to print every leaf folder for review.
// Sparse/busy flags are diagnostic: no artificial file-count rule is enforced.
if (process.env.CONTENT_AUDIT === "1") {
  const rows = libraryContentAudit();
  console.info(
    `${sources.length} ordinary libraries · ${rows.length} leaf folders · ${rows.filter((row) => row.review === "single").length} single-file folders · ${rows.filter((row) => row.review === "empty").length} empty folders · ${rows.filter((row) => row.review === "busy").length} busy folders`,
  );
  console.table(rows);
}

describe("Configured SharePoint libraries", () => {
  it.each(configured)(
    "keeps $workspace / $library fields, views and content types valid",
    (source) => {
      const definition = source.definition!;
      expect(auditLibraryDefinition(definition, source.files)).toEqual([]);
      expect(definition.views?.length).toBeGreaterThanOrEqual(2);
      expect(definition.views?.length).toBeLessThanOrEqual(4);
      expect(definition.contentTypes?.length ?? 0).toBeLessThanOrEqual(3);
      for (const type of definition.contentTypes ?? []) {
        expect(type.template || type.fields?.length).toBeTruthy();
      }
      const originalIds = new Set(source.files.map((file) => file.id));
      for (const view of definition.views ?? []) {
        const rows = queryLibrary(source.files, {
          folder: "",
          definition,
          view: view.id,
          embedded: true,
        });
        expect(
          rows.every(
            (file) => originalIds.has(file.id) && source.files.includes(file),
          ),
        ).toBe(true);
        expect(new Set(rows.map((file) => file.id)).size).toBe(rows.length);
      }
    },
  );

  it("uses several small business metadata models rather than a universal Period-only schema", () => {
    const models = new Set(
      configured.map((source) =>
        libraryFields(source.definition)
          .map((field) => field.key)
          .filter(
            (key) =>
              !["name", "modified", "owner", "status", "contentType"].includes(
                key,
              ),
          )
          .sort()
          .join("|"),
      ),
    );
    expect(models.size).toBeGreaterThan(8);
    expect(
      configured.some((source) => !source.definition!.contentTypes?.length),
    ).toBe(true);
    expect(
      configured.some((source) => !!source.definition!.contentTypes?.length),
    ).toBe(true);
    expect(
      configured.every((source) => source.definition!.columns.length <= 7),
    ).toBe(true);
  });

  it.each(sources)(
    "preserves file identities and folder context in $workspace / $library",
    (source) => {
      expect(new Set(source.files.map((file) => file.id)).size).toBe(
        source.files.length,
      );
      expect(
        source.files.every((file) => file.name && file.folder !== undefined),
      ).toBe(true);
      expect(
        source.files.some((file) =>
          /[ _-]v\d+(?:\.\d+)?\.(docx|xlsx|pptx|pdf)$/i.test(file.name),
        ),
      ).toBe(false);
      expect(
        source.files.some((file) => /(?:^|\/)\.\.(?:\/|$)/.test(file.folder)),
      ).toBe(false);
    },
  );

  it("keeps each ordinary file in one primary working library across workspaces", () => {
    const owners = new Map<string, string>();
    for (const source of sources) {
      const owner = `${source.workspace} / ${source.library}`;
      for (const file of source.files) {
        expect(
          owners.get(file.id),
          `${file.name} has more than one working location`,
        ).toBeUndefined();
        owners.set(file.id, owner);
      }
    }
  });

  it("assigns every functional file to exactly one declared library and retains canonical objects", () => {
    for (const config of functionalConfigs) {
      const libraries = functionalLibraries[config.id];
      expect(libraries?.length).toBeGreaterThan(0);
      for (const file of config.files) {
        const owners = libraries.filter(
          (library) => library.id === file.documentLibrary,
        );
        expect(owners, `${config.id}: ${file.id}`).toHaveLength(1);
        expect(owners[0].areas).toContain(file.area);
        expect(
          functionalLibraryDocuments(
            config,
            owners[0],
            file.area === "employee-representation" ? "skyler" : "riley",
          ),
        ).toContain(file);
        expect(file.folder).toBe(file.folderPath);
      }
    }
  });

  it("reports varied leaf populations and deliberately permits small reference folders", () => {
    const rows = libraryContentAudit();
    expect(new Set(rows.map((row) => row.documents)).size).toBeGreaterThan(3);
    expect(rows.some((row) => row.documents >= 3 && row.documents <= 8)).toBe(
      true,
    );
    expect(rows.some((row) => row.review === "single")).toBe(true);
    const functionalRows = functionalConfigs.flatMap((config) =>
      functionalLibraries[config.id].flatMap((library) =>
        auditLibraryFolders(functionalLibraryDocuments(config, library)),
      ),
    );
    expect(
      functionalRows.filter((row) => row.count >= 2).length,
    ).toBeGreaterThan(functionalRows.length / 2);
    // These flags are reviewed, never automatically filled with placeholder files.
    expect(
      rows.every(
        (row) => row.documents >= 0 && Number.isInteger(row.documents),
      ),
    ).toBe(true);
  });
});

describe("Ordinary library discovery retains protected boundaries", () => {
  it("excludes all protected functional subjects from every ordinary view and search result", () => {
    for (const config of functionalConfigs) {
      const protectedIds = new Set(
        config.protected.map((subject) => subject.id),
      );
      const publicFiles = functionalLibraries[config.id].flatMap((library) =>
        functionalLibraryDocuments(config, library),
      );
      expect(publicFiles.every((file) => !protectedIds.has(file.id))).toBe(
        true,
      );
      const results = queryLibrary(publicFiles, {
        folder: "",
        view: "Recent documents",
      });
      expect(results.every((file) => !protectedIds.has(file.id))).toBe(true);
    }
  });

  it("keeps restricted planning and executive audiences out of ordinary aggregated discovery", () => {
    const ordinaryIds = new Set(
      sources
        .filter(
          (source) =>
            source.workspace === "Planning" || source.workspace === "Executive",
        )
        .flatMap((source) => source.files.map((file) => file.id)),
    );
    for (const file of planningFiles.filter(
      (file) => file.library === "restricted",
    ))
      expect(ordinaryIds.has(file.id)).toBe(false);
    for (const file of executiveFiles.filter(
      (file) => file.audience !== "base",
    ))
      expect(ordinaryIds.has(file.id)).toBe(false);
    expect(
      visibleExecutiveFiles("base").every((file) => file.audience === "base"),
    ).toBe(true);
  });

  it("models protected financial subjects as boundaries instead of synthetic transaction files", () => {
    const protectedIds = new Set(
      Object.values(protectedSubjects)
        .flat()
        .map(([id]) => id),
    );
    expect(financialFiles.every((file) => !protectedIds.has(file.id))).toBe(
      true,
    );
    expect(JSON.stringify(financialFiles)).not.toMatch(
      /bank account number|cardholder|iban|payroll record|customer address/i,
    );
  });
});
