import { describe, expect, it } from "vitest";
import {
  childLibraryFolders,
  documentVersions,
  libraryDate,
  libraryFolders,
  libraryLocation,
  queryLibrary,
  type LibraryDocument,
} from "./library";

const files: LibraryDocument[] = [
  {
    id: "DOC-101",
    name: "Event Brief.docx",
    folder: "Campaigns/Current",
    status: "In review",
    modified: "2026-10-14",
    owner: "Alex Morgan",
    summary: "A briefing for the autumn acquisition activity.",
  },
  {
    id: "DOC-102",
    name: "Event Schedule.xlsx",
    folder: "Campaigns/Current",
    status: "Approved",
    modified: "2026-10-16",
    owner: "Maya Chen",
  },
  {
    id: "DOC-103",
    name: "Lessons Learned.docx",
    folder: "Campaigns/Previous",
    status: "Approved",
    modified: "2025-11-04",
    owner: "Alex Morgan",
  },
  {
    id: "DOC-104",
    name: "Read Me.docx",
    folder: "",
    status: "Draft",
    modified: "2026-10-12",
    owner: "Maya Chen",
  },
];

describe("SharePoint library navigation", () => {
  it("shows only immediate folders, including explicitly empty nested folders", () => {
    const folders = libraryFolders(files, [
      "Campaigns/Upcoming/Working drafts",
    ]);
    expect(childLibraryFolders(folders, "")).toEqual(["Campaigns"]);
    expect(childLibraryFolders(folders, "Campaigns")).toEqual([
      "Campaigns/Current",
      "Campaigns/Previous",
      "Campaigns/Upcoming",
    ]);
    expect(childLibraryFolders(folders, "Campaigns/Upcoming")).toEqual([
      "Campaigns/Upcoming/Working drafts",
    ]);
    expect(queryLibrary(files, { folder: "" }).map((file) => file.id)).toEqual([
      "DOC-104",
    ]);
    expect(queryLibrary(files, { folder: "Campaigns" })).toEqual([]);
  });

  it("searches within the current folder tree and combines status and saved views", () => {
    expect(
      queryLibrary(files, { folder: "Campaigns", search: "autumn" }).map(
        (file) => file.id,
      ),
    ).toEqual(["DOC-101"]);
    expect(
      queryLibrary(files, {
        folder: "Campaigns",
        search: "event",
        status: "Approved",
      }).map((file) => file.id),
    ).toEqual(["DOC-102"]);
    expect(
      queryLibrary(files, { folder: "Campaigns", view: "In review" }).map(
        (file) => file.id,
      ),
    ).toEqual(["DOC-101"]);
    expect(
      queryLibrary(files, { folder: "Campaigns/Current", search: "lessons" }),
    ).toEqual([]);
    expect(
      queryLibrary(files, { folder: "", view: "Recent documents" }).map(
        (file) => file.id,
      ),
    ).toEqual(["DOC-102", "DOC-101", "DOC-104", "DOC-103"]);
  });

  it("opens original file IDs from old links without applying another library's folder state", () => {
    const legacy = libraryLocation(
      new URLSearchParams("file=DOC-101"),
      "Documents",
      files,
    );
    expect(legacy.file).toBe(files[0]);
    expect(legacy.folder).toBe("Campaigns/Current");
    expect(
      libraryLocation(
        new URLSearchParams("library=Documents&folder=Campaigns%2FPrevious"),
        "Documents",
        files,
      ).folder,
    ).toBe("Campaigns/Previous");
    expect(
      libraryLocation(
        new URLSearchParams("library=Other&file=DOC-101&folder=Private"),
        "Documents",
        files,
      ),
    ).toEqual({ folder: "", file: undefined });
    expect(
      libraryLocation(
        new URLSearchParams("folder=Unrelated"),
        "Documents",
        files,
        "Campaigns/Current",
      ).folder,
    ).toBe("Campaigns/Current");
  });

  it("derives a readable version trail from the file's status, editor and modification date", () => {
    const approved = documentVersions(files[1]);
    expect(approved[0]).toEqual({
      version: "1.0",
      date: "16 Oct 2026",
      author: "Maya Chen",
      note: "Approved version",
      current: true,
    });
    expect(approved[1].date).toBe("13 Oct 2026");
    expect(approved[2].date).toBe("9 Oct 2026");
    const draft = documentVersions(files[0]);
    expect(draft[0].version).toBe("0.3");
    expect(draft[0].note).toContain("In review");
    expect(draft.every((version) => version.author === "Alex Morgan")).toBe(
      true,
    );
  });

  it("keeps date-only ISO and human dates on the same calendar day in Details and version history", () => {
    for (const modified of [
      "2026-10-16",
      "16 Oct 2026",
      "2026-10-05",
      "5 Oct 2026",
    ]) {
      const file = { ...files[0], modified };
      expect(documentVersions(file)[0].date).toBe(libraryDate(modified));
      expect(documentVersions(file)[0].date).toBe(
        modified.includes("16") ? "16 Oct 2026" : "5 Oct 2026",
      );
    }
    expect(
      documentVersions({ ...files[0], modified: "16 Oct 2026" })[1].date,
    ).toBe("13 Oct 2026");
    const timestamp = "2026-10-16T00:30:00Z";
    expect(documentVersions({ ...files[0], modified: timestamp })[0].date).toBe(
      libraryDate(timestamp),
    );
    expect(
      queryLibrary(
        [
          { ...files[0], id: "old", modified: "28 Sep 2026" },
          { ...files[1], id: "new", modified: "5 Oct 2026" },
        ],
        { folder: "", view: "Recent documents" },
      ).map((file) => file.id),
    ).toEqual(["new", "old"]);
  });
});
