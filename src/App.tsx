import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
} from "@fluentui/react-components";
import {
  Home24Regular,
  Folder24Regular,
  Document24Regular,
  LockClosed24Regular,
  CheckmarkCircle24Regular,
  ChartMultiple24Regular,
  TargetArrow24Regular,
  Search20Regular,
  Add20Regular,
  ArrowUpload20Regular,
  Filter20Regular,
  Dismiss20Regular,
  Info20Regular,
  Link20Regular,
  History20Regular,
  ArrowRight20Regular,
  GridDots24Regular,
  ChevronDown16Regular,
} from "@fluentui/react-icons";
import {
  documents,
  libraries,
  roles,
  currentCycle,
  milestones,
  type Document,
  type Role,
  type View,
  type LibraryId,
} from "./data/workspace";
import {
  queryDocuments,
  emptyFilters,
  canAccessRestricted,
  type Filters,
} from "./utils/documents";
const icons = {
  planning: Folder24Regular,
  strategy: TargetArrow24Regular,
  reporting: ChartMultiple24Regular,
  approved: CheckmarkCircle24Regular,
  restricted: LockClosed24Regular,
};
const views: View[] = [
  "All Documents",
  "Current Planning Cycle",
  "In Review",
  "Approved",
  "By Planning Area",
];
const formatDate = (date: string) =>
  new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
function FileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()!;
  return (
    <span className={`file-icon ${ext}`} aria-label={`${ext} file`}>
      {ext === "xlsx"
        ? "X"
        : ext === "pptx"
          ? "P"
          : ext === "pdf"
            ? "PDF"
            : "W"}
    </span>
  );
}
function Status({ status }: { status: string }) {
  return (
    <span className={`status ${status.toLowerCase().replaceAll(" ", "-")}`}>
      {status === "Approved" ? "✓ " : ""}
      {status}
    </span>
  );
}
function readRole(): Role {
  try {
    const value = localStorage.getItem("workspace-role");
    return roles.includes(value as Role) ? (value as Role) : "Workspace Member";
  } catch {
    return "Workspace Member";
  }
}
function route() {
  const params = new URLSearchParams(location.search);
  const page = location.pathname.split("/")[1];
  return {
    page: libraries.some((l) => l.id === page) ? (page as LibraryId) : "home",
    folder: params.get("folder") ?? "",
    view: views.includes(params.get("view") as View)
      ? (params.get("view") as View)
      : "All Documents",
  };
}
export default function App() {
  const [locationState, setLocationState] = useState(route);
  const { page, folder, view } = locationState;
  const [role, setRole] = useState<Role>(readRole);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState<Document | null>(() => {
    const id = new URLSearchParams(location.search).get("document");
    return (
      documents.find(
        (d) =>
          d.id === id &&
          d.library === page &&
          (d.library !== "restricted" || canAccessRestricted(role)),
      ) ?? null
    );
  });
  const [modal, setModal] = useState<"about" | "version" | null>(null);
  const [toast, setToast] = useState("");
  const [sort, setSort] = useState<keyof Document>("name");
  const [descending, setDescending] = useState(false);
  useEffect(() => {
    const listener = () => {
      setLocationState(route());
      setSelected(null);
      setSearch("");
      setFilters(emptyFilters);
    };
    window.addEventListener("popstate", listener);
    return () => window.removeEventListener("popstate", listener);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timeout);
  }, [toast]);
  function navigate(
    next: string,
    nextFolder = "",
    nextView: View = "All Documents",
  ) {
    const params = new URLSearchParams();
    if (nextFolder) params.set("folder", nextFolder);
    if (nextView !== "All Documents") params.set("view", nextView);
    history.pushState(
      {},
      "",
      `/${next === "home" ? "" : next}${params.size ? "?" + params : ""}`,
    );
    setLocationState(route());
    setSearch("");
    setFilters(emptyFilters);
    setSelected(null);
    setFilterOpen(false);
  }
  const library = libraries.find((l) => l.id === page);
  const allowed = page !== "restricted" || canAccessRestricted(role);
  const scoped = allowed ? documents.filter((d) => d.library === page) : [];
  const rows = queryDocuments(
    scoped,
    view,
    search,
    filters,
    folder,
    sort,
    descending,
  );
  const activeFilters = Object.values(filters).filter(Boolean).length;
  function setView(next: View) {
    navigate(page, "", next);
  }
  async function copyLink(doc: Document) {
    const url = `${location.origin}/${doc.library}?document=${doc.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast("Demo document link copied. This prototype has no stored file.");
    } catch {
      setToast("Clipboard is unavailable in this browser.");
    }
  }
  function sortBy(key: keyof Document) {
    setSort(key);
    setDescending(sort === key ? !descending : false);
  }
  function documentTable(items: Document[], recent = false) {
    if (recent)
      items = queryDocuments(
        items,
        "All Documents",
        "",
        emptyFilters,
        "",
        sort,
        descending,
      );
    return (
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th className="file-column" aria-label="File type" />
              <th
                aria-sort={
                  sort === "name"
                    ? descending
                      ? "descending"
                      : "ascending"
                    : "none"
                }
              >
                <button onClick={() => sortBy("name")}>
                  Name {sort === "name" ? (descending ? "↓" : "↑") : ""}
                </button>
              </th>
              {!recent && (
                <>
                  <th>
                    <button onClick={() => sortBy("cycle")}>
                      Planning cycle
                    </button>
                  </th>
                  <th>
                    <button onClick={() => sortBy("type")}>
                      Document type
                    </button>
                  </th>
                </>
              )}
              <th>
                <button onClick={() => sortBy("status")}>Status</button>
              </th>
              <th>
                <button onClick={() => sortBy("owner")}>Owner</button>
              </th>
              <th>
                <button onClick={() => sortBy("modified")}>
                  Modified {sort === "modified" ? (descending ? "↓" : "↑") : ""}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((d, i) => (
              <FragmentRow
                key={d.id}
                doc={d}
                previous={items[i - 1]}
                grouped={!recent && view === "By Planning Area"}
                recent={recent}
                onSelect={() => setSelected(d)}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="m365-header">
        <GridDots24Regular />
        <span className="product">SharePoint</span>
        <span className="tenant">Northstar Organisation</span>
        <div className="demo-role">
          <label htmlFor="role">Demo as</label>
          <select
            id="role"
            value={role}
            onChange={(e) => {
              const next = e.target.value as Role;
              setRole(next);
              setSelected(null);
              setModal(null);
              try {
                localStorage.setItem("workspace-role", next);
              } catch {
                /* Storage may be disabled. */
              }
            }}
          >
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <span className="avatar">
            {role === "Executive Reviewer"
              ? "ER"
              : role === "Planning Coordinator"
                ? "PC"
                : "WM"}
          </span>
        </div>
      </header>
      <div className="site-header">
        <div className="site-mark">OP</div>
        <div>
          <span className="eyebrow">
            NORTHSTAR ORGANISATION · SHARED WORKSPACE
          </span>
          <h1>Organisational Planning & Reporting</h1>
        </div>
        <span className="site-members">
          <span className="member-dots">AM&nbsp; JE&nbsp; TR</span> Workspace
          members
        </span>
      </div>
      <div className="workspace">
        <aside className="sidebar">
          <nav aria-label="Workspace navigation">
            <button
              className={page === "home" ? "nav-active" : ""}
              onClick={() => navigate("home")}
            >
              <Home24Regular />
              Home
            </button>
            <div className="nav-section">DOCUMENT LIBRARIES</div>
            {libraries.map((l) => {
              const Icon = icons[l.id];
              return (
                <button
                  key={l.id}
                  className={page === l.id ? "nav-active" : ""}
                  onClick={() => navigate(l.id)}
                >
                  <Icon />
                  <span>{l.name}</span>
                  {l.id === "restricted" && <span className="nav-lock">·</span>}
                </button>
              );
            })}
          </nav>
          <div className="sidebar-footer">
            <p>
              One workspace.
              <br />
              Organised around the work.
            </p>
            <button onClick={() => setModal("about")}>
              <Info20Regular />
              About this prototype
            </button>
          </div>
        </aside>
        <main id="main-content" className="main-content">
          {page === "home" ? (
            <>
              <div className="page-heading">
                <span className="eyebrow">WORKSPACE HOME</span>
                <h2>A shared place to plan what’s next.</h2>
                <p>
                  Shared workspace for organisation-wide strategy, planning,
                  review and performance reporting.
                </p>
              </div>
              <section className="current-cycle">
                <div className="cycle-top">
                  <div>
                    <span className="eyebrow">CURRENT CYCLE</span>
                    <h3>2027 Annual Planning</h3>
                    <p>
                      Bring our priorities, resources and contributions
                      together.
                    </p>
                  </div>
                  <span className="open-status">
                    <span />
                    Open for contributions
                  </span>
                </div>
                <div className="milestones">
                  {milestones.map(([name, date], i) => (
                    <div key={name} className={i === 0 ? "complete" : ""}>
                      <span className="milestone-dot">
                        {i === 0 ? "✓" : i + 1}
                      </span>
                      <strong>{name}</strong>
                      <span>{date}</span>
                    </div>
                  ))}
                </div>
                <div className="cycle-bottom">
                  <Button
                    appearance="primary"
                    icon={<Folder24Regular />}
                    onClick={() => navigate("planning", currentCycle)}
                  >
                    Open current planning cycle
                  </Button>
                  <span>Next milestone: contributions due 30 October</span>
                </div>
              </section>
              <div className="quick-links">
                <button onClick={() => navigate("planning", "", "In Review")}>
                  <History20Regular />
                  <div>
                    <strong>Documents in review</strong>
                    <span>See what needs a second look</span>
                  </div>
                  <ArrowRight20Regular />
                </button>
                <button onClick={() => navigate("approved")}>
                  <CheckmarkCircle24Regular />
                  <div>
                    <strong>Approved plans and reports</strong>
                    <span>Find our authoritative outputs</span>
                  </div>
                  <ArrowRight20Regular />
                </button>
              </div>
              <section className="recent">
                <div className="section-heading">
                  <h3>Recent documents</h3>
                  <button onClick={() => navigate("planning")}>
                    Go to Planning Cycles <ArrowRight20Regular />
                  </button>
                </div>
                {documentTable(
                  [...documents]
                    .filter((d) => d.library !== "restricted")
                    .sort((a, b) => b.modified.localeCompare(a.modified))
                    .slice(0, 5),
                  true,
                )}
              </section>
              <div className="home-foot">
                <CheckmarkCircle24Regular />
                <span>
                  Working together, with a clear place for the final record.
                </span>
              </div>
            </>
          ) : (
            library && (
              <>
                <div className="breadcrumb">
                  <button onClick={() => navigate("home")}>Workspace</button>
                  <span>/</span>
                  <button onClick={() => navigate(library.id)}>
                    {library.name}
                  </button>
                  {folder && (
                    <>
                      <span>/</span>
                      <span>{folder}</span>
                    </>
                  )}
                </div>
                <div className="library-heading">
                  <div>
                    <h2>{folder || library.name}</h2>
                    <p>{library.description}</p>
                  </div>
                  <span
                    className={`library-label ${page === "approved" ? "final-label" : ""}`}
                  >
                    {page === "restricted" ? (
                      <LockClosed24Regular />
                    ) : page === "approved" ? (
                      <CheckmarkCircle24Regular />
                    ) : (
                      <Document24Regular />
                    )}
                    {page === "approved"
                      ? "Approved records"
                      : page === "restricted"
                        ? "Restricted"
                        : "Working information"}
                  </span>
                </div>
                {!allowed ? (
                  <section className="access-state">
                    <div className="access-icon">
                      <LockClosed24Regular />
                    </div>
                    <h3>A protected space for sensitive planning</h3>
                    <p>
                      This area has a narrower access group because it contains
                      restricted planning material.
                    </p>
                    <p>
                      Your ordinary workspace membership gives you access to the
                      shared working libraries and approved outputs.
                    </p>
                    <Button
                      appearance="primary"
                      onClick={() => navigate("planning")}
                    >
                      Return to Planning Cycles
                    </Button>
                    <span>
                      For this demonstration, choose Executive Reviewer in “Demo
                      as” to explore this area.
                    </span>
                  </section>
                ) : (
                  <>
                    {page === "approved" && (
                      <div className="record-banner">
                        <CheckmarkCircle24Regular />
                        <div>
                          <strong>The agreed baseline</strong>
                          <span>
                            Approved outputs are available to read. Working
                            drafts remain in the collaboration libraries.
                          </span>
                        </div>
                        <span className="read-only">Read only</span>
                      </div>
                    )}
                    {page === "restricted" && (
                      <div className="record-banner">
                        <LockClosed24Regular />
                        <div>
                          <strong>Executive planning review group</strong>
                          <span>
                            Access applies to this whole protected area, rather
                            than individual file exceptions.
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="command-bar">
                      <div>
                        {page !== "approved" && (
                          <>
                            <Button
                              appearance="primary"
                              icon={<Add20Regular />}
                              onClick={() =>
                                setToast(
                                  "Demo: a new document would be created in this library with its planning metadata.",
                                )
                              }
                            >
                              New
                            </Button>
                            <Button
                              appearance="subtle"
                              icon={<ArrowUpload20Regular />}
                              onClick={() =>
                                setToast(
                                  "Demo: upload a contribution and assign its cycle, area and document type.",
                                )
                              }
                            >
                              Upload
                            </Button>
                            {role === "Planning Coordinator" && (
                              <Button
                                appearance="subtle"
                                onClick={() =>
                                  setToast(
                                    "Demo: library settings manage shared metadata and inherited workspace access.",
                                  )
                                }
                              >
                                Library settings
                              </Button>
                            )}
                          </>
                        )}
                        <Button
                          appearance="subtle"
                          icon={<Link20Regular />}
                          onClick={() => {
                            void navigator.clipboard
                              .writeText(location.href)
                              .then(
                                () => setToast("Library link copied."),
                                () => setToast("Clipboard unavailable."),
                              );
                          }}
                        >
                          Copy library link
                        </Button>
                      </div>
                      <div>
                        <label className="view-control">
                          <span className="sr-only">Saved view</span>
                          <select
                            value={view}
                            onChange={(e) => setView(e.target.value as View)}
                          >
                            {views.map((v) => (
                              <option key={v}>{v}</option>
                            ))}
                          </select>
                          <ChevronDown16Regular />
                        </label>
                        <Button
                          appearance="subtle"
                          icon={<Filter20Regular />}
                          onClick={() => setFilterOpen(!filterOpen)}
                          aria-expanded={filterOpen}
                        >
                          Filters{activeFilters ? ` (${activeFilters})` : ""}
                        </Button>
                      </div>
                    </div>
                    <div className="library-search">
                      <Input
                        contentBefore={<Search20Regular />}
                        placeholder="Search this library"
                        aria-label="Search this library"
                        value={search}
                        onChange={(_, data) => setSearch(data.value)}
                      />
                      <span>
                        {rows.length} documents{folder ? " in this cycle" : ""}
                      </span>
                      {(search || activeFilters > 0) && (
                        <button
                          onClick={() => {
                            setSearch("");
                            setFilters(emptyFilters);
                          }}
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                    {filterOpen && (
                      <div className="filter-bar">
                        {(["cycle", "type", "area", "status"] as const).map(
                          (key) => (
                            <label key={key}>
                              {
                                {
                                  cycle: "Planning cycle",
                                  type: "Document type",
                                  area: "Planning area",
                                  status: "Status",
                                }[key]
                              }
                              <select
                                aria-label={
                                  {
                                    cycle: "Planning cycle",
                                    type: "Document type",
                                    area: "Planning area",
                                    status: "Status",
                                  }[key]
                                }
                                value={filters[key]}
                                onChange={(e) =>
                                  setFilters({
                                    ...filters,
                                    [key]: e.target.value,
                                  })
                                }
                              >
                                <option value="">All</option>
                                {[...new Set(scoped.map((d) => d[key]))]
                                  .sort()
                                  .map((v) => (
                                    <option key={v}>{v}</option>
                                  ))}
                              </select>
                            </label>
                          ),
                        )}
                        <Button
                          onClick={() => {
                            setFilters(emptyFilters);
                            setSearch("");
                          }}
                        >
                          Clear filters
                        </Button>
                      </div>
                    )}
                    {!folder &&
                      view === "All Documents" &&
                      !search &&
                      !activeFilters &&
                      library.folders.length > 0 && (
                        <div className="folder-list">
                          {library.folders.map((f) => (
                            <button key={f} onClick={() => navigate(page, f)}>
                              <Folder24Regular />
                              <strong>{f}</strong>
                              <span>
                                {scoped.filter((d) => d.cycle === f).length}{" "}
                                documents
                              </span>
                              <ArrowRight20Regular />
                            </button>
                          ))}
                        </div>
                      )}
                    {documentTable(rows)}
                    {!rows.length && (
                      <div className="empty-state">
                        <Search20Regular />
                        <h3>No documents match</h3>
                        <p>
                          Try another view or clear your search and filters.
                        </p>
                        <Button
                          onClick={() => {
                            setSearch("");
                            setFilters(emptyFilters);
                            setView("All Documents");
                          }}
                        >
                          Show all documents
                        </Button>
                      </div>
                    )}
                    <div className="library-foot">
                      {page === "approved"
                        ? "Final records · Approved outputs · Read access for workspace members"
                        : "Shared metadata · One shallow cycle layer · Version history"}
                      <span>Fictional demonstration content</span>
                    </div>
                  </>
                )}
              </>
            )
          )}
        </main>
      </div>
      <Drawer
        type="overlay"
        position="end"
        size="medium"
        open={!!selected && !modal}
        onOpenChange={(_, d) => {
          if (!d.open) setSelected(null);
        }}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                aria-label="Close details"
                icon={<Dismiss20Regular />}
                onClick={() => setSelected(null)}
              />
            }
          >
            Details
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          {selected && (
            <>
              <div className="detail-file">
                <FileIcon name={selected.name} />
                <h3>{selected.name}</h3>
                <Status status={selected.status} />
              </div>
              <p className="detail-location">
                {libraries.find((l) => l.id === selected.library)?.name} /{" "}
                {selected.cycle}
              </p>
              <div className="detail-actions">
                <Button
                  appearance="primary"
                  onClick={() =>
                    setToast(
                      "Demo preview: this fictional document has no stored file.",
                    )
                  }
                >
                  Open
                </Button>
                <Button
                  icon={<Link20Regular />}
                  onClick={() => copyLink(selected)}
                >
                  Copy link
                </Button>
                <Button
                  icon={<History20Regular />}
                  onClick={() => setModal("version")}
                >
                  Version history
                </Button>
              </div>
              <h4>Properties</h4>
              <dl className="properties">
                {[
                  ["Owner", selected.owner],
                  ["Modified", formatDate(selected.modified)],
                  ["Modified by", selected.modifiedBy],
                  ["Planning cycle", selected.cycle],
                  ["Planning area", selected.area],
                  ["Document type", selected.type],
                  ["Status", selected.status],
                  ["Sensitivity", selected.sensitivity],
                  ["Record state", selected.recordState],
                  ...(selected.approvedDate
                    ? [
                        ["Approval status", "Approved"],
                        ["Approved date", formatDate(selected.approvedDate)],
                        ["Record category", selected.recordCategory!],
                      ]
                    : []),
                ].map(([key, val]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{val}</dd>
                  </div>
                ))}
              </dl>
              {role === "Executive Reviewer" &&
                selected.recordState !== "Final record" && (
                  <Button
                    onClick={() =>
                      setToast(
                        "Demo: an approval would be recorded before an authoritative output is published to Approved Plans & Reports.",
                      )
                    }
                  >
                    Review / approve
                  </Button>
                )}
            </>
          )}
        </DrawerBody>
      </Drawer>
      <Dialog
        open={!!modal}
        onOpenChange={(_, d) => {
          if (!d.open) setModal(null);
        }}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>
              {modal === "about" ? "About this prototype" : "Version history"}
            </DialogTitle>
            <DialogContent>
              {modal === "about" ? (
                <>
                  <p>
                    This prototype uses fictional content to demonstrate
                    document workspace structure, metadata, views and access
                    boundaries.
                  </p>
                  <p>
                    One shared workspace contains purpose-built libraries.
                    Recognisable cycles provide a shallow folder layer; metadata
                    offers different ways to find the same information. Approved
                    outputs form a controlled record library, while sensitive
                    scenarios have a bounded access group.
                  </p>
                  <p>
                    Roles, files, uploads, approval and version history are
                    demonstrations. There is no authentication or document
                    backend.
                  </p>
                </>
              ) : (
                <>
                  <p>{selected?.name}</p>
                  <p className="muted">
                    Illustrative history · no actual stored versions
                  </p>
                  <div className="version-list">
                    {(selected?.status === "Approved"
                      ? [
                          ["1.0", "Approved baseline"],
                          ["0.3", "Review comments incorporated"],
                          ["0.2", "Area input incorporated"],
                          ["0.1", "Initial draft"],
                        ]
                      : [
                          ["0.3", "Review comments incorporated"],
                          ["0.2", "Area input incorporated"],
                          ["0.1", "Initial draft"],
                        ]
                    ).map(([v, n]) => (
                      <div key={v}>
                        <strong>v{v}</strong>
                        <span>
                          {n}
                          <small>{selected?.modifiedBy}</small>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button appearance="primary" onClick={() => setModal(null)}>
                Close
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      {toast && (
        <div className="toast" role="status">
          <Info20Regular />
          <span>{toast}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <Dismiss20Regular />
          </button>
        </div>
      )}
    </div>
  );
}
function FragmentRow({
  doc: d,
  previous,
  grouped,
  recent,
  onSelect,
}: {
  doc: Document;
  previous?: Document;
  grouped: boolean;
  recent: boolean;
  onSelect: () => void;
}) {
  return (
    <>
      {grouped && previous?.area !== d.area && (
        <tr className="group-row">
          <td colSpan={7}>{d.area}</td>
        </tr>
      )}
      <tr>
        <td>
          <FileIcon name={d.name} />
        </td>
        <td>
          <button className="document-name" onClick={onSelect}>
            {d.name}
          </button>
          {recent && (
            <span className="document-subtitle">
              {libraries.find((l) => l.id === d.library)?.name}
            </span>
          )}
        </td>
        {!recent && (
          <>
            <td>{d.cycle}</td>
            <td>{d.type}</td>
          </>
        )}
        <td>
          <Status status={d.status} />
        </td>
        <td>
          <span className="owner-avatar">
            {d.owner
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
          {d.owner}
        </td>
        <td>{formatDate(d.modified)}</td>
      </tr>
    </>
  );
}
