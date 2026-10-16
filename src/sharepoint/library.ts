export interface LibraryDocument {
  id: string;
  name: string;
  /** Slash-separated path, relative to this library. Empty means library root. */
  folder: string;
  modified?: string;
  owner?: string;
  status?: string;
  summary?: string;
  metadata?: Record<string, string>;
}

export type LibraryView =
  "All Documents" | "Recent documents" | "In review" | "Approved";
export type LibrarySort = "name" | "modified" | "owner" | "status";
export const libraryViews: LibraryView[] = [
  "All Documents",
  "Recent documents",
  "In review",
  "Approved",
];

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
  },
) {
  const folder = normaliseFolder(options.folder);
  const query = (options.search ?? "").trim().toLocaleLowerCase();
  const view = options.view ?? "All Documents";
  const recursive = !!(
    query ||
    options.status ||
    view !== "All Documents" ||
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
      (!query ||
        [
          file.name,
          path,
          file.owner,
          status,
          file.summary,
          ...Object.values(file.metadata ?? {}),
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(query))
    );
  });
  const sort =
    options.sort ??
    (view === "Recent documents" || options.embedded ? "modified" : "name");
  const descending = options.descending ?? sort === "modified";
  return rows.sort((a, b) => {
    const first = a[sort] ?? "";
    const second = b[sort] ?? "";
    const dateComparison =
      sort === "modified"
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

export function libraryLocation(
  params: URLSearchParams,
  title: string,
  files: LibraryDocument[],
  initialFolder = "",
) {
  const scoped = params.get("library") === title;
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

export function documentProperties(file: LibraryDocument) {
  const fields: [string, string][] = [
    ["Modified", libraryDate(file.modified)],
    ["Modified by", file.owner ?? "Not recorded"],
    ["Status", file.status ?? "Draft"],
    ["Location", file.folder || "Library root"],
  ];
  const extra = Object.entries(file.metadata ?? {}).find(
    ([name, value]) =>
      value &&
      !fields.some(
        ([key]) => key.toLocaleLowerCase() === name.toLocaleLowerCase(),
      ),
  );
  if (extra) fields.push(extra);
  return fields;
}

export function documentVersions(file: LibraryDocument) {
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
