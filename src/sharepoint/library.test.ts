import { describe, expect, it } from "vitest";
import {
  auditLibraryDefinition,
  auditLibraryFolders,
  childLibraryFolders,
  contentTypeDefaults,
  documentProperties,
  libraryColumns,
  libraryValue,
  documentVersions,
  libraryDate,
  libraryFolders,
  libraryLocation,
  queryLibrary,
  type LibraryDocument,
  type LibraryDefinition,
} from "./library";

const files: LibraryDocument[] = [
  {
    sensitivity: "Internal",
    id: "DOC-101",
    name: "Event Brief.docx",
    folder: "Campaigns/Current",
    status: "In review",
    modified: "2026-10-14",
    owner: "Alex Morgan",
    summary: "A briefing for the autumn acquisition activity.",
  },
  {
    sensitivity: "Internal",
    id: "DOC-102",
    name: "Event Schedule.xlsx",
    folder: "Campaigns/Current",
    status: "Approved",
    modified: "2026-10-16",
    owner: "Maya Chen",
  },
  {
    sensitivity: "Internal",
    id: "DOC-103",
    name: "Lessons Learned.docx",
    folder: "Campaigns/Previous",
    status: "Approved",
    modified: "2025-11-04",
    owner: "Alex Morgan",
  },
  {
    sensitivity: "Internal",
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

const supplierDefinition: LibraryDefinition = {
  id: "purchasing",
  name: "Purchasing & Suppliers",
  columns: [
    { key: "name", label: "Name" },
    { key: "Supplier", label: "Supplier", required: true },
    {
      key: "Stage",
      label: "Stage",
      type: "choice",
      choices: ["Evaluation", "Current", "Closed"],
    },
    { key: "status", label: "Status" },
    { key: "modified", label: "Modified", type: "date" },
  ],
  fields: [{ key: "Review date", label: "Review date", type: "date" }],
  contentTypes: [
    {
      id: "evaluation",
      name: "Supplier Evaluation",
      template: "Evaluation criteria, evidence and recommendation.",
      fields: ["Supplier", "Stage"],
      defaults: { Stage: "Evaluation", status: "Draft", owner: "Jordan Lee" },
    },
  ],
  views: [
    { id: "all", name: "All Documents" },
    {
      id: "current",
      name: "Current suppliers",
      filters: [{ field: "Stage", value: "Current" }],
      sortBy: "Supplier",
    },
    {
      id: "evaluations",
      name: "Evaluations",
      filters: [{ field: "contentType", value: "evaluation" }],
      columns: ["name", "Supplier", "Stage"],
    },
    {
      id: "review",
      name: "Review due",
      filters: [
        { field: "Review date", value: "2026-11-01", operator: "before" },
      ],
      sortBy: "Review date",
    },
  ],
};
const supplierFiles: LibraryDocument[] = [
  {
    ...files[0],
    contentType: "evaluation",
    metadata: {
      Supplier: "Northstar",
      Stage: "Evaluation",
      "Review date": "2026-10-29",
      Hidden: "Not an ordinary property",
    },
  },
  {
    ...files[1],
    metadata: {
      Supplier: "Cedar",
      Stage: "Current",
      "Review date": "2026-12-15",
    },
  },
  { ...files[2], metadata: { Supplier: "Aster", Stage: "Current" } },
];

describe("Library-specific metadata and content types", () => {
  it("filters and sorts the same canonical objects using selected business metadata", () => {
    const current = queryLibrary(supplierFiles, {
      folder: "Campaigns",
      view: "current",
      definition: supplierDefinition,
    });
    expect(current.map((file) => file.id)).toEqual(["DOC-103", "DOC-102"]);
    expect(current[0]).toBe(supplierFiles[2]);
    expect(
      queryLibrary(supplierFiles, {
        folder: "Campaigns/Current",
        view: "review",
        definition: supplierDefinition,
      }),
    ).toEqual([supplierFiles[0]]);
    expect(
      queryLibrary(supplierFiles, {
        folder: "Campaigns",
        view: "evaluations",
        definition: supplierDefinition,
      }),
    ).toEqual([supplierFiles[0]]);
    expect(
      queryLibrary(supplierFiles, {
        folder: "Campaigns/Previous",
        view: "evaluations",
        definition: supplierDefinition,
      }),
    ).toEqual([]);
  });

  it("finds content type names and selected metadata without changing file identity", () => {
    expect(
      queryLibrary(supplierFiles, {
        folder: "",
        search: "supplier evaluation",
        definition: supplierDefinition,
      }),
    ).toEqual([supplierFiles[0]]);
    expect(
      queryLibrary(supplierFiles, {
        folder: "",
        search: "cedar",
        definition: supplierDefinition,
      }),
    ).toEqual([supplierFiles[1]]);
    expect(
      libraryValue(supplierFiles[0], "contentType", supplierDefinition),
    ).toBe("Supplier Evaluation");
    expect(
      libraryColumns(supplierDefinition, "evaluations").map(
        (column) => column.key,
      ),
    ).toEqual(["name", "Supplier", "Stage", "sensitivity"]);
  });

  it("keeps Details tied to the library schema and uses content type defaults for new documents", () => {
    const properties = Object.fromEntries(
      documentProperties(supplierFiles[0], supplierDefinition),
    );
    expect(properties).toMatchObject({
      "Content type": "Supplier Evaluation",
      Supplier: "Northstar",
      Stage: "Evaluation",
      "Review date": "29 Oct 2026",
      Modified: "14 Oct 2026",
      Version: "0.3",
    });
    expect(properties.Hidden).toBeUndefined();
    expect(contentTypeDefaults(supplierDefinition.contentTypes![0])).toEqual({
      status: "Draft",
      owner: "Jordan Lee",
      metadata: { Stage: "Evaluation" },
    });
    expect(supplierDefinition.contentTypes![0].defaults).toHaveProperty(
      "status",
      "Draft",
    );
  });

  it("uses a supplied document history rather than inventing renamed copies", () => {
    const file: LibraryDocument = {
      ...supplierFiles[0],
      versions: [
        {
          version: "2.0",
          date: "2026-10-14",
          author: "Jordan Lee",
          note: "Evaluation approved",
          current: true,
        },
        {
          version: "1.1",
          date: "2026-10-10",
          author: "Maya Chen",
          note: "Operational evidence added",
        },
      ],
    };
    expect(documentVersions(file)).toEqual([
      {
        version: "2.0",
        date: "14 Oct 2026",
        author: "Jordan Lee",
        note: "Evaluation approved",
        current: true,
      },
      {
        version: "1.1",
        date: "10 Oct 2026",
        author: "Maya Chen",
        note: "Operational evidence added",
        current: false,
      },
    ]);
    expect(
      Object.fromEntries(documentProperties(file, supplierDefinition)).Version,
    ).toBe("2.0");
    expect(file.id).toBe(supplierFiles[0].id);
  });

  it("audits invalid view/type references and leaf counts without requiring artificial population", () => {
    expect(auditLibraryDefinition(supplierDefinition, supplierFiles)).toEqual(
      [],
    );
    const invalid = auditLibraryDefinition(
      {
        ...supplierDefinition,
        views: [
          {
            id: "bad",
            name: "Bad view",
            filters: [{ field: "Unknown", value: "Any" }],
          },
        ],
      },
      [{ ...supplierFiles[0], contentType: "unknown" }],
    );
    expect(invalid).toHaveLength(2);
    expect(auditLibraryFolders(supplierFiles, ["Campaigns/Upcoming"])).toEqual([
      { folder: "Campaigns/Current", count: 2, flag: undefined },
      { folder: "Campaigns/Previous", count: 1, flag: "single" },
      { folder: "Campaigns/Upcoming", count: 0, flag: "empty" },
    ]);
    expect(
      auditLibraryFolders(
        Array.from({ length: 13 }, (_, i) => ({ ...files[0], id: String(i) })),
      )[0].flag,
    ).toBe("busy");
    expect(supplierFiles).toHaveLength(3);
  });
});
