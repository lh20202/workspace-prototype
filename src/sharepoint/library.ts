import type { SensitivityLabel } from "./sensitivity";
import { matchesDisplayText } from "../i18n/search";

export interface LibraryDocument {
  sensitivity: SensitivityLabel;
  id: string;
  name: string;
  /** Slash-separated path, relative to this library. Empty means library root. */
  folder: string;
  modified?: string;
  owner?: string;
  status?: string;
  summary?: string;
  metadata?: Record<string, string>;
  contentType?: string;
  versions?: LibraryVersion[];
}

/** A library only declares properties that help its ordinary work. */
export interface LibraryColumn {
  key: string;
  label: string;
  type?: "text" | "date" | "choice";
  choices?: string[];
  required?: boolean;
}
export interface LibraryContentType {
  id: string;
  name: string;
  template?: string;
  extension?: string;
  fields?: string[];
  defaults?: Record<string, string>;
}
export interface LibraryFilter {
  field: string;
  value: string | string[];
  operator?: "equals" | "contains" | "not-equals" | "before" | "after";
}
export interface LibraryViewDefinition {
  id: string;
  name: string;
  filters?: LibraryFilter[];
  sortBy?: string;
  descending?: boolean;
  columns?: string[];
  recursive?: boolean;
}
export interface LibraryDefinition {
  defaultSensitivity?: SensitivityLabel;
  id: string;
  name: string;
  purpose?: string;
  columns: LibraryColumn[];
  fields?: LibraryColumn[];
  contentTypes?: LibraryContentType[];
  views?: LibraryViewDefinition[];
}
export interface LibraryVersion {
  version: string;
  date: string;
  author: string;
  note: string;
  current?: boolean;
}
export type LibraryView = string;
export type LibrarySort = string;
export const defaultLibraryColumns: LibraryColumn[] = [
  { key: "name", label: "Name" },
  { key: "sensitivity", label: "Sensitivity" },
  { key: "modified", label: "Modified", type: "date" },
  { key: "owner", label: "Modified by" },
  { key: "status", label: "Status" },
];
export const libraryViews: LibraryView[] = [
  "All Documents",
  "Recent documents",
  "In review",
  "Approved",
];

export function libraryFields(definition?: LibraryDefinition) {
  const fields = [
    ...(definition?.columns ?? defaultLibraryColumns),
    ...(definition?.fields ?? []),
    { key: "sensitivity", label: "Sensitivity" },
  ];
  return fields.filter(
    (field, i) => fields.findIndex((other) => other.key === field.key) === i,
  );
}

export function libraryContentType(
  file: Pick<LibraryDocument, "contentType">,
  definition?: LibraryDefinition,
) {
  return definition?.contentTypes?.find(
    (type) => type.id === file.contentType || type.name === file.contentType,
  );
}

export function libraryValue(
  file: LibraryDocument,
  key: string,
  definition?: LibraryDefinition,
): string {
  switch (key) {
    case "sensitivity":
      return file.sensitivity;
    case "name":
      return file.name;
    case "modified":
      return file.modified ?? "";
    case "owner":
      return file.owner ?? "";
    case "status":
      return file.status ?? "Draft";
    case "contentType":
      return (
        libraryContentType(file, definition)?.name ??
        file.contentType ??
        "Document"
      );
    case "folder":
      return file.folder;
    default:
      return file.metadata?.[key] ?? "";
  }
}

export function libraryViewDefinitions(
  definition?: LibraryDefinition,
): LibraryViewDefinition[] {
  return definition?.views?.length
    ? definition.views
    : libraryViews.map((name) => ({ id: name, name }));
}

export function libraryColumns(definition?: LibraryDefinition, view?: string) {
  const all = libraryFields(definition);
  const active = libraryViewDefinitions(definition).find(
    (item) => item.id === view || item.name === view,
  );
  const columns = active?.columns
    ? active.columns
        .map((key) => all.find((column) => column.key === key))
        .filter((column): column is LibraryColumn => !!column)
    : (definition?.columns ?? defaultLibraryColumns);
  const withSensitivity = columns.filter(
    (column) => column.key !== "sensitivity",
  );
  const modifiedIndex = withSensitivity.findIndex(
    (column) => column.key === "modified",
  );
  withSensitivity.splice(
    modifiedIndex < 0 ? withSensitivity.length : modifiedIndex,
    0,
    { key: "sensitivity", label: "Sensitivity" },
  );
  return withSensitivity.some((column) => column.key === "name")
    ? withSensitivity
    : [{ key: "name", label: "Name" }, ...withSensitivity];
}

export function contentTypeDefaults(type?: LibraryContentType) {
  const defaults = { ...(type?.defaults ?? {}) };
  const status = defaults.status ?? "Draft";
  const owner = defaults.owner ?? "You";
  delete defaults.status;
  delete defaults.owner;
  return { status, owner, metadata: defaults };
}

export function normaliseFolder(folder: string) {
  return folder
    .split("/")
    .map((part) => part.trim())
    .filter((part) => part && part !== "." && part !== "..")
    .join("/");
}

export function libraryFolders(
  files: LibraryDocument[],
  explicit: string[] = [],
) {
  const paths = new Set<string>();
  for (const folder of [...explicit, ...files.map((file) => file.folder)]) {
    const parts = normaliseFolder(folder).split("/").filter(Boolean);
    parts.forEach((_, i) => paths.add(parts.slice(0, i + 1).join("/")));
  }
  return [...paths].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );
}

export function childLibraryFolders(paths: string[], folder: string) {
  const parent = normaliseFolder(folder);
  return paths.filter((path) => {
    const pieces = path.split("/");
    return pieces.slice(0, -1).join("/") === parent;
  });
}

export function queryLibrary(
  files: LibraryDocument[],
  options: {
    folder: string;
    search?: string;
    status?: string;
    view?: LibraryView;
    sort?: LibrarySort;
    descending?: boolean;
    embedded?: boolean;
    definition?: LibraryDefinition;
  },
) {
  const folder = normaliseFolder(options.folder);
  const query = (options.search ?? "").trim().toLocaleLowerCase();
  const view = options.view ?? libraryViewDefinitions(options.definition)[0].id;
  const savedView = libraryViewDefinitions(options.definition).find(
    (item) => item.id === view || item.name === view,
  );
  const isDefault =
    savedView?.id === libraryViewDefinitions(options.definition)[0].id;
  const recursive = !!(
    query ||
    options.status ||
    savedView?.recursive ||
    !isDefault ||
    options.embedded
  );
  const rows = files.filter((file) => {
    const path = normaliseFolder(file.folder);
    const inFolder = recursive
      ? !folder || path === folder || path.startsWith(folder + "/")
      : path === folder;
    const status = file.status ?? "Draft";
    return (
      inFolder &&
      (!options.status || status === options.status) &&
      (view !== "In review" || /review|approval|submitted/i.test(status)) &&
      (view !== "Approved" ||
        /approved|published|current|final/i.test(status)) &&
      (savedView?.filters ?? []).every((filter) => {
        const value = libraryValue(
          file,
          filter.field,
          options.definition,
        ).toLocaleLowerCase();
        const expected = (
          Array.isArray(filter.value) ? filter.value : [filter.value]
        ).map((item) => item.toLocaleLowerCase());
        switch (filter.operator) {
          case "contains":
            return expected.some((item) => value.includes(item));
          case "not-equals":
            return (
              !expected.includes(value) &&
              !(
                filter.field === "contentType" &&
                expected.includes(
                  (file.contentType ?? "Document").toLocaleLowerCase(),
                )
              )
            );
          case "before":
          case "after": {
            if (!value) return false;
            const actualDate = calendarDate(value)?.getTime();
            const expectedDate = calendarDate(expected[0])?.getTime();
            const order =
              actualDate !== undefined && expectedDate !== undefined
                ? actualDate - expectedDate
                : value.localeCompare(expected[0]);
            return filter.operator === "before" ? order < 0 : order > 0;
          }
          default:
            return (
              expected.includes(value) ||
              (filter.field === "contentType" &&
                expected.includes(
                  (file.contentType ?? "Document").toLocaleLowerCase(),
                ))
            );
        }
      }) &&
      (!query ||
        matchesDisplayText(
          [
            file.name,
            path,
            file.owner,
            status,
            file.summary,
            file.sensitivity,
            file.contentType,
            libraryContentType(file, options.definition)?.name,
            ...Object.values(file.metadata ?? {}),
          ].join("\n"),
          query,
        ))
    );
  });
  const sort =
    options.sort ??
    savedView?.sortBy ??
    (view === "Recent documents" || options.embedded ? "modified" : "name");
  const descending =
    options.descending ?? savedView?.descending ?? sort === "modified";
  return rows.sort((a, b) => {
    const first = libraryValue(a, sort, options.definition);
    const second = libraryValue(b, sort, options.definition);
    const dateComparison =
      sort === "modified" ||
      libraryFields(options.definition).some(
        (field) => field.key === sort && field.type === "date",
      )
        ? (calendarDate(first)?.getTime() ?? 0) -
          (calendarDate(second)?.getTime() ?? 0)
        : undefined;
    return (
      ((dateComparison ??
        first.localeCompare(second, undefined, { numeric: true })) ||
        a.name.localeCompare(b.name)) * (descending ? -1 : 1)
    );
  });
}

// Exact legacy display names remain valid for bookmarks after a destination
// rename. These aliases do not change the supplied library's files or scope.
const legacyLibraryTitles = new Map<string, readonly string[]>([
  ["Workforce & Ethics", ["Workforce & Culture"]],
  ["Curriculum", ["Capability & Learning"]],
  ["Quality Monitoring", ["Quality & Monitoring"]],
  ["Money In", ["Income & Reconciliation"]],
  ["Money Out", ["Income & Reconciliation", "Payments & Close"]],
  ["Value for Money", ["Planning & Analysis"]],
  ["Bank Vault", ["Treasury & Banking"]],
  ["Research Lab", ["Research & Insight"]],
]);

export function libraryTitleMatches(
  requestedTitle: string | null,
  title: string,
) {
  return (
    requestedTitle === title ||
    (requestedTitle !== null &&
      (legacyLibraryTitles.get(title)?.includes(requestedTitle) ?? false))
  );
}

export function libraryLocation(
  params: URLSearchParams,
  title: string,
  files: LibraryDocument[],
  initialFolder = "",
) {
  const scoped = libraryTitleMatches(params.get("library"), title);
  const file =
    scoped || !params.has("library")
      ? files.find((item) => item.id === params.get("file"))
      : undefined;
  return {
    folder: normaliseFolder(
      file?.folder ??
        (scoped ? (params.get("folder") ?? initialFolder) : initialFolder),
    ),
    file,
  };
}

/** Preserve a displayed calendar day before doing date arithmetic. */
function calendarDate(value: string) {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const human = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(value);
  let year: number, month: number, day: number;
  if (iso) {
    year = Number(iso[1]);
    month = Number(iso[2]) - 1;
    day = Number(iso[3]);
  } else if (human) {
    year = Number(human[3]);
    day = Number(human[1]);
    month = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ].indexOf(human[2].slice(0, 3).toLowerCase());
  } else {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return undefined;
    year = parsed.getFullYear();
    month = parsed.getMonth();
    day = parsed.getDate();
  }
  const date = new Date(Date.UTC(year, month, day, 12));
  return month < 0 ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month ||
    date.getUTCDate() !== day
    ? undefined
    : date;
}

export function libraryDate(value?: string) {
  if (!value) return "—";
  const date = calendarDate(value);
  return !date
    ? value
    : date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
}

export function documentProperties(
  file: LibraryDocument,
  definition?: LibraryDefinition,
) {
  const keys = [
    ...(file.contentType || definition?.contentTypes?.length
      ? ["contentType"]
      : []),
    ...libraryFields(definition)
      .map((field) => field.key)
      .filter((key) => !["name", "modified", "owner"].includes(key)),
    "owner",
    "modified",
  ];
  const labels: Record<string, string> = {
    contentType: "Content type",
    owner: "Modified by",
    modified: "Modified",
    status: "Status",
    sensitivity: "Sensitivity",
  };
  const fields: [string, string][] = [...new Set(keys)].flatMap((key) => {
    const field = libraryFields(definition).find((item) => item.key === key);
    const value = libraryValue(file, key, definition);
    if (!value) return [];
    return [
      [
        field?.label ?? labels[key] ?? key,
        field?.type === "date" || key === "modified"
          ? libraryDate(value)
          : value,
      ],
    ];
  });
  if (!definition) {
    const extra = Object.entries(file.metadata ?? {}).find(
      ([name, value]) =>
        value &&
        !fields.some(
          ([key]) => key.toLocaleLowerCase() === name.toLocaleLowerCase(),
        ),
    );
    if (extra) fields.push(extra);
  }
  fields.push(["Version", documentVersions(file)[0]?.version ?? "0.1"]);
  fields.push(["Location", file.folder || "Library root"]);
  return fields;
}

export function documentVersions(file: LibraryDocument) {
  if (file.versions?.length)
    return file.versions.map((version, i) => ({
      ...version,
      date: libraryDate(version.date),
      current: version.current ?? i === 0,
    }));
  const isApproved = /approved|published|current|final/i.test(
    file.status ?? "",
  );
  const raw = file.modified ? calendarDate(file.modified) : undefined;
  const dateAt = (daysAgo: number) => {
    if (!raw || Number.isNaN(raw.getTime())) return "Not recorded";
    return libraryDate(
      new Date(raw.getTime() - daysAgo * 86400000).toISOString().slice(0, 10),
    );
  };
  return [
    {
      version: isApproved ? "1.0" : "0.3",
      date: dateAt(0),
      author: file.owner ?? "Document owner",
      note: isApproved
        ? file.status?.toLocaleLowerCase() === "current"
          ? "Current baseline"
          : `${file.status} version`
        : `${file.status ?? "Draft"} · latest changes`,
      current: true,
    },
    {
      version: "0.2",
      date: dateAt(3),
      author: file.owner ?? "Document owner",
      note: "Review comments incorporated",
      current: false,
    },
    {
      version: "0.1",
      date: dateAt(7),
      author: file.owner ?? "Document owner",
      note: "Initial working draft",
      current: false,
    },
  ];
}

/** Development audit: highlight sparse/busy leaf folders without changing their contents. */
export function auditLibraryFolders(
  files: LibraryDocument[],
  explicit: string[] = [],
) {
  const folders = libraryFolders(files, explicit);
  const leaves = folders.filter(
    (folder) => !folders.some((other) => other.startsWith(folder + "/")),
  );
  if (files.some((file) => !normaliseFolder(file.folder))) leaves.unshift("");
  return leaves.map((folder) => {
    const count = files.filter(
      (file) => normaliseFolder(file.folder) === folder,
    ).length;
    return {
      folder,
      count,
      flag:
        count === 0
          ? "empty"
          : count === 1
            ? "single"
            : count > 12
              ? "busy"
              : undefined,
    };
  });
}

/** Configuration checks are developer diagnostics, never product-facing taxonomy. */
export function auditLibraryDefinition(
  definition: LibraryDefinition,
  files: LibraryDocument[],
) {
  const issues: string[] = [];
  const valid = new Set([
    "name",
    "modified",
    "owner",
    "status",
    "contentType",
    "folder",
    ...libraryFields(definition).map((field) => field.key),
  ]);
  for (const view of definition.views ?? []) {
    for (const field of [
      ...(view.columns ?? []),
      ...(view.filters ?? []).map((filter) => filter.field),
      ...(view.sortBy ? [view.sortBy] : []),
    ]) {
      if (!valid.has(field))
        issues.push(`View ${view.name} references unknown field ${field}`);
    }
  }
  for (const type of definition.contentTypes ?? []) {
    for (const key of type.fields ?? [])
      if (!valid.has(key))
        issues.push(
          `Content type ${type.name} references unknown field ${key}`,
        );
  }
  for (const file of files) {
    if (
      file.contentType &&
      file.contentType !== "Document" &&
      !libraryContentType(file, definition)
    )
      issues.push(
        `File ${file.id} references unknown content type ${file.contentType}`,
      );
    if (file.folder !== normaliseFolder(file.folder))
      issues.push(`File ${file.id} has an invalid folder path`);
  }
  return issues;
}
