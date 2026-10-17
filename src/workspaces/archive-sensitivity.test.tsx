import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import ArchivePane from "./ArchivePane";
import {
  archiveRecords,
  legacyArchiveRecords,
  legacyFolders,
  searchArchive,
} from "./archiveData";
import { isSensitivityLabel } from "../sharepoint/sensitivity";

afterEach(() => vi.unstubAllGlobals());
function render(page: string, record?: string) {
  vi.stubGlobal(
    "location",
    new URL(
      `/archives/${page}${record ? `?record=${record}` : ""}`,
      "https://example.test",
    ),
  );
  return renderToStaticMarkup(
    createElement(ArchivePane, { page, items: [], onItem: () => {} }),
  );
}

describe("preserved catalogue and legacy document sensitivity", () => {
  it("classifies all preserved and legacy files without adding Public releases", () => {
    expect(archiveRecords).toHaveLength(9);
    expect(legacyArchiveRecords.map((record) => record.area)).toEqual(
      legacyFolders,
    );
    const records = [...archiveRecords, ...legacyArchiveRecords];
    expect(new Set(records.map((record) => record.id)).size).toBe(
      records.length,
    );
    for (const record of records) {
      expect(isSensitivityLabel(record.sensitivity), record.id).toBe(true);
      expect(record.sensitivity).toBe("Internal");
    }
    expect(searchArchive("", { sensitivity: "Internal" })).toEqual(
      archiveRecords,
    );
  });
  it("shows the shared canonical property in catalogue result cards", () => {
    const html = render("collections");
    expect(html.match(/aria-label="Sensitivity: Internal"/g)).toHaveLength(
      archiveRecords.length,
    );
    expect(html).not.toContain("sensitivity-public");
  });
  it("shows the same sensitivity in every catalogue and legacy record preview", () => {
    for (const record of [...archiveRecords, ...legacyArchiveRecords]) {
      const html = render(
        record.id.startsWith("LEGACY-") ? "legacy-drive" : "collections",
        record.id,
      );
      const preview = html.slice(html.indexOf('class="archive-preview"'));
      expect(preview, record.id).toContain(
        'aria-label="Archive record preview"',
      );
      expect(preview).toContain("<dt>Sensitivity</dt>");
      expect(preview).toContain(
        `aria-label="Sensitivity: ${record.sensitivity}"`,
      );
      expect(preview).toContain(record.name.replaceAll("&", "&amp;"));
    }
  });
});
