import type { LibraryDocument, LibraryDefinition } from "../sharepoint/library";
import type { OperationalFile } from "../logistics/data";
import { files, fileContext } from "./data";
export const libraries = [
  {
    id: "income-documents",
    name: "Income & Reconciliation",
    areas: ["income", "reconciliation"],
  },
  { id: "payment-documents", name: "Payments & Close", areas: ["payments"] },
  {
    id: "planning-documents",
    name: "Planning & Analysis",
    areas: ["planning"],
  },
  {
    id: "accounting-documents",
    name: "Accounting & Reporting",
    areas: ["accounting"],
  },
  { id: "treasury-documents", name: "Treasury & Banking", areas: ["treasury"] },
];
export const folderNames: Record<string, string> = {
  income: "Income guidance",
  reconciliation: "Reconciliation",
  payments: "Supplier payments",
  planning: "Budgets & forecasts",
  accounting: "Financial reporting",
  treasury: "Cash forecasts",
};
export function folderFor(id: string, area: string) {
  return `${folderNames[area]}/${["FIN-05", "FIN-17", "FIN-18"].includes(id) ? "2027 budget" : ["FIN-02", "FIN-19", "FIN-20"].includes(id) ? "Q4 2026" : "October 2026"}`;
}

export function financialDocument(f: OperationalFile): LibraryDocument {
  const period = ["FIN-05", "FIN-17", "FIN-18"].includes(f.id)
    ? "2027 budget"
    : f.folder === "planning"
      ? "2026 Q4"
      : "October 2026";
  return {
    id: f.id,
    sensitivity: f.sensitivity,
    name: f.name,
    folder: folderFor(f.id, f.folder),
    owner: f.owner,
    modified: f.modified,
    status: f.status,
    summary:
      fileContext[f.id] ||
      "Shared process guidance and contribution coordination. Transactional records remain in the authorised source system.",
    metadata: {
      Period: period,
      Activity: folderNames[f.folder],
      "Document type": /Checklist/i.test(f.name)
        ? "Checklist"
        : /Notes|Commentary/i.test(f.name)
          ? "Working notes"
          : "Guidance",
    },
    versions:
      f.id === "FIN-06"
        ? [
            {
              version: "2.0",
              date: "16 Oct 2026",
              author: "Sam Patel",
              note: "Updated matching and escalation guidance",
              current: true,
            },
            {
              version: "1.2",
              date: "8 Oct 2026",
              author: "Jamie Reed",
              note: "Clarified review responsibilities",
              current: false,
            },
            {
              version: "1.1",
              date: "25 Sep 2026",
              author: "Sam Patel",
              note: "Added reference examples",
              current: false,
            },
            {
              version: "1.0",
              date: "9 Sep 2026",
              author: "Sam Patel",
              note: "Initial published guidance",
              current: false,
            },
          ]
        : undefined,
  };
}
export function libraryFiles(l: (typeof libraries)[number]): LibraryDocument[] {
  return files.filter((f) => l.areas.includes(f.folder)).map(financialDocument);
}
export const definitions: Record<string, LibraryDefinition> =
  Object.fromEntries(
    libraries.map((library) => [
      library.id,
      {
        id: library.id,
        name: library.name,
        columns: [
          { key: "name", label: "Name" },
          {
            key:
              library.id === "planning-documents" ? "Period" : "Document type",
            label:
              library.id === "planning-documents" ? "Period" : "Document type",
          },
          { key: "status", label: "Status" },
          { key: "owner", label: "Owner" },
          { key: "modified", label: "Modified", type: "date" },
        ],
        fields: [
          {
            key:
              library.id === "planning-documents" ? "Document type" : "Period",
            label:
              library.id === "planning-documents" ? "Document type" : "Period",
          },
          { key: "Activity", label: "Activity" },
        ],
        views: [
          { id: "all", name: "All Documents" },
          {
            id: "current",
            name: "Current Guidance",
            filters: [{ field: "status", value: "Current" }],
            recursive: true,
          },
          {
            id: "period",
            name: "By Period",
            sortBy: "Period",
            recursive: true,
          },
        ],
      } as LibraryDefinition,
    ]),
  );
