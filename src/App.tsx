import FileIcon from "./components/DocumentIcon";
import { planningPath, planningPage, accessRequestHref } from "./utils/routes";
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
  Alert24Regular,
  QuestionCircle24Regular,
  Settings24Regular,
  People24Regular,
  Star20Filled,
  Calendar20Regular,
  PeopleTeam24Regular,
  DocumentTable20Regular,
  Money20Regular,
  ClipboardTask20Regular,
} from "@fluentui/react-icons";
import {
  documents,
  libraries,
  currentUser,
  accessContact,
  departments,
  quickLinks,
  currentCycle,
  milestones,
  type Document,
  type View,
  type LibraryId,
} from "./data/workspace";
import {
  queryDocuments,
  emptyFilters,
  canAccessRestricted,
  type Filters,
  filtersFromParams,
  childFolders,
  browseDocuments,
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
const documentCount = (count: number) =>
  `${count} document${count === 1 ? "" : "s"}`;
const formatDate = (date: string) =>
  new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
function Status({ status }: { status: string }) {
  return (
    <span className={`status ${status.toLowerCase().replaceAll(" ", "-")}`}>
      {status === "Approved" ? "✓ " : ""}
      {status}
    </span>
  );
}
function route() {
  const params = new URLSearchParams(location.search);
  const page = planningPage(location.pathname);
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
  const role = currentUser.role;
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const [favorite, setFavorite] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(() =>
    filtersFromParams(new URLSearchParams(location.search)),
  );
  const [filterOpen, setFilterOpen] = useState(
    () => !!filtersFromParams(new URLSearchParams(location.search)).area,
  );
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
  const [modal, setModal] = useState<"about" | "version" | "milestones" | null>(
    null,
  );
  const [toast, setToast] = useState("");
  const [sort, setSort] = useState<keyof Document>("name");
  const [descending, setDescending] = useState(false);
  useEffect(() => {
    const listener = () => {
      setLocationState(route());
      setSearch("");
      setModal(null);
      setFilterOpen(
        !!filtersFromParams(new URLSearchParams(location.search)).area,
      );
      setFilters(filtersFromParams(new URLSearchParams(location.search)));
      const id = new URLSearchParams(location.search).get("document");
      setSelected(
        documents.find(
          (d) =>
            d.id === id &&
            d.library === route().page &&
            d.library !== "restricted",
        ) ?? null,
      );
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
    nextFilters: Filters = emptyFilters,
    documentId = "",
  ) {
    const params = new URLSearchParams();
    if (nextFolder) params.set("folder", nextFolder);
    if (nextView !== "All Documents") params.set("view", nextView);
    for (const [key, value] of Object.entries(nextFilters))
      if (value) params.set(key, value);
    if (documentId) params.set("document", documentId);
    history.pushState(
      {},
      "",
      `${planningPath(next)}${params.size ? "?" + params : ""}`,
    );
    window.scrollTo({ top: 0, behavior: "instant" });
    setLocationState(route());
    setSearch("");
    setFilters(nextFilters);
    setSelected(
      documents.find(
        (d) =>
          d.id === documentId &&
          d.library === next &&
          d.library !== "restricted",
      ) ?? null,
    );
    setFilterOpen(!!nextFilters.area);
    setWorkspaceSearch("");
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
  const folderMode =
    view === "All Documents" &&
    !search.trim() &&
    !Object.values(filters).some(Boolean);
  const folders = childFolders(scoped, folder);
  const displayRows = folderMode
    ? browseDocuments(scoped, folder).sort(
        (a, b) =>
          String(a[sort]).localeCompare(String(b[sort])) *
          (descending ? -1 : 1),
      )
    : rows;
  const activeFilters = Object.values(filters).filter(Boolean).length;
  function updateFilters(next: Filters) {
    setFilters(next);
    const params = new URLSearchParams(location.search);
    for (const key of Object.keys(emptyFilters) as (keyof Filters)[]) {
      if (next[key]) params.set(key, next[key]);
      else params.delete(key);
    }
    history.replaceState(
      {},
      "",
      `${location.pathname}${params.size ? "?" + params : ""}`,
    );
  }
  function setView(next: View) {
    navigate(page, "", next, filters);
  }
  function openDocument(doc: Document) {
    navigate(
      doc.library,
      doc.folderPath,
      "All Documents",
      emptyFilters,
      doc.id,
    );
  }
  async function copyLink(doc: Document) {
    const url = `${location.origin}${planningPath(doc.library)}?document=${doc.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast("Document link copied.");
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
        <button
          className="global-icon"
          aria-label="Microsoft 365 apps"
          onClick={() =>
            setToast(
              "Microsoft 365 app launcher is not connected in this prototype.",
            )
          }
        >
          <GridDots24Regular />
        </button>
        <span className="product">SharePoint</span>
        <div className="workspace-search">
          <Input
            contentBefore={<Search20Regular />}
            placeholder="Search this workspace"
            aria-label="Search this workspace"
            value={workspaceSearch}
            onChange={(_, data) => setWorkspaceSearch(data.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setWorkspaceSearch("");
            }}
          />
          {workspaceSearch.trim() && (
            <div
              className="workspace-results"
              aria-label="Workspace search results"
            >
              <div className="search-results-heading">Documents</div>
              {documents
                .filter(
                  (d) =>
                    d.library !== "restricted" &&
                    d.name
                      .toLowerCase()
                      .includes(workspaceSearch.trim().toLowerCase()),
                )
                .map((d) => (
                  <button key={d.id} onClick={() => openDocument(d)}>
                    <FileIcon name={d.name} />
                    <span>
                      {d.name}
                      <small>
                        {libraries.find((l) => l.id === d.library)?.name}
                      </small>
                    </span>
                  </button>
                ))}
              {!documents.some(
                (d) =>
                  d.library !== "restricted" &&
                  d.name
                    .toLowerCase()
                    .includes(workspaceSearch.trim().toLowerCase()),
              ) && <p>No documents found.</p>}
            </div>
          )}
        </div>
        <div className="global-utilities">
          <button
            className="global-icon"
            aria-label="Notifications"
            onClick={() => setToast("You're up to date. No new notifications.")}
          >
            <Alert24Regular />
          </button>
          <button
            className="global-icon"
            aria-label="Help"
            onClick={() =>
              setToast(
                "Use Quick links for key documents, or search by filename. Library filters narrow results by planning metadata.",
              )
            }
          >
            <QuestionCircle24Regular />
          </button>
          <button
            className="global-icon"
            aria-label="Settings"
            onClick={() =>
              setToast(
                "Workspace preferences use the default reading and document view.",
              )
            }
          >
            <Settings24Regular />
          </button>
          <button
            className="profile-button"
            aria-label="Signed in as Maya Chen"
            onClick={() =>
              setToast("Maya Chen · Workspace member and contributor")
            }
          >
            <img src="/maya-avatar.svg" alt="Illustrated avatar of Maya Chen" />
          </button>
        </div>
      </header>
      <div className="site-header">
        <div className="site-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="site-title">
          <h1>Organisational Planning & Reporting</h1>
          <button
            className="teams-button"
            aria-label="Microsoft Teams connection"
            title="Microsoft Teams"
            onClick={() =>
              setToast("This workspace's Teams connection is illustrative.")
            }
          >
            <PeopleTeam24Regular />
            <b>T</b>
          </button>
        </div>
        <div className="site-context">
          <span>Private group</span>
          <button
            onClick={() => setFavorite(!favorite)}
            aria-pressed={favorite}
          >
            <Star20Filled />
            {favorite ? "Added to favorites" : "Add to favorites"}
          </button>
          <button
            onClick={() =>
              setToast(
                "34 workspace members collaborate on organisational planning and reporting.",
              )
            }
          >
            <People24Regular />
            34 members
          </button>
        </div>
      </div>
      <div className="workspace">
        <aside className="sidebar">
          <nav aria-label="Workspace navigation">
            <button
              aria-current={page === "home" ? "page" : undefined}
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
                  aria-current={page === l.id ? "page" : undefined}
                  className={page === l.id ? "nav-active" : ""}
                  onClick={() => navigate(l.id)}
                >
                  <Icon />
                  <span>{l.name}</span>
                </button>
              );
            })}
          </nav>
          <div className="sidebar-footer">
            <button onClick={() => setModal("about")}>
              <Info20Regular />
              About this prototype
            </button>
          </div>
        </aside>
        <main id="main-content" className="main-content">
          {page === "home" ? (
            <div className="home-layout">
              <div className="home-main">
                <div className="page-heading">
                  <h2>Organisational Planning & Reporting</h2>
                  <p>
                    Shared workspace for organisation-wide strategy, planning,
                    review and performance reporting.
                  </p>
                </div>
                <section
                  className="current-cycle"
                  aria-labelledby="cycle-title"
                >
                  <div className="cycle-top">
                    <div>
                      <span className="eyebrow">CURRENT PLANNING CYCLE</span>
                      <h3 id="cycle-title">2027 Annual Planning</h3>
                    </div>
                    <span className="open-status">
                      <span />
                      Open for contributions
                    </span>
                  </div>
                  <div className="cycle-next">
                    <Calendar20Regular />
                    <span>
                      Business-area inputs due <strong>30 October 2026</strong>
                    </span>
                    <button onClick={() => setModal("milestones")}>
                      View all milestones <ArrowRight20Regular />
                    </button>
                  </div>
                </section>
                <section className="quick-links-section">
                  <div className="section-heading">
                    <h3>Quick links</h3>
                  </div>
                  <div className="quick-links">
                    {quickLinks.map((link, i) => {
                      const Icon = [
                        DocumentTable20Regular,
                        Money20Regular,
                        Document24Regular,
                        ClipboardTask20Regular,
                        History20Regular,
                      ][i];
                      return (
                        <button
                          key={link.label}
                          onClick={() => {
                            const doc = documents.find(
                              (d) => d.name === link.name,
                            );
                            if (doc) openDocument(doc);
                          }}
                        >
                          <span className="quick-link-icon">
                            <Icon />
                          </span>
                          <span>{link.label}</span>
                        </button>
                      );
                    })}
                    <button onClick={() => setModal("milestones")}>
                      <span className="quick-link-icon">
                        <Calendar20Regular />
                      </span>
                      <span>Current milestones</span>
                    </button>
                  </div>
                </section>
                <section className="recent">
                  <div className="section-heading">
                    <h3>Recent documents</h3>
                    <button onClick={() => navigate("planning")}>
                      See all <ArrowRight20Regular />
                    </button>
                  </div>
                  <div className="recent-list">
                    {[...documents]
                      .filter((d) => d.library !== "restricted")
                      .sort((a, b) => b.modified.localeCompare(a.modified))
                      .slice(0, 5)
                      .map((d) => (
                        <button key={d.id} onClick={() => openDocument(d)}>
                          <FileIcon name={d.name} />
                          <span className="recent-name">
                            {d.name}
                            <small>
                              {libraries.find((l) => l.id === d.library)?.name}{" "}
                              · {d.cycle}
                            </small>
                          </span>
                          <span className="recent-date">
                            {formatDate(d.modified)}
                          </span>
                        </button>
                      ))}
                  </div>
                </section>
              </div>
              <aside className="home-aside" aria-label="Planning shortcuts">
                <section className="department-jumps">
                  <h3>Jump to department submissions</h3>
                  <p>2027 Annual Planning</p>
                  {departments.map((department) => (
                    <button
                      key={department}
                      onClick={() =>
                        navigate("planning", currentCycle, "All Documents", {
                          ...emptyFilters,
                          area: department,
                          type: "Submission",
                        })
                      }
                    >
                      <span>{department}</span>
                      <ArrowRight20Regular />
                    </button>
                  ))}
                </section>
                <section className="home-reference">
                  <h3>Review & reference</h3>
                  <button onClick={() => navigate("planning", "", "In Review")}>
                    <History20Regular />
                    Documents in review
                  </button>
                  <button onClick={() => navigate("approved")}>
                    <CheckmarkCircle24Regular />
                    Approved plans & reports
                  </button>
                </section>
              </aside>
            </div>
          ) : (
            library && (
              <>
                <div className="breadcrumb">
                  <button onClick={() => navigate("home")}>Workspace</button>
                  <span>/</span>
                  <button onClick={() => navigate(library.id)}>
                    {library.name}
                  </button>
                  {folder
                    .split("/")
                    .filter(Boolean)
                    .map((part, i, parts) => (
                      <span className="breadcrumb-part" key={i}>
                        <span>/</span>
                        <button
                          onClick={() =>
                            navigate(page, parts.slice(0, i + 1).join("/"))
                          }
                        >
                          {part}
                        </button>
                      </span>
                    ))}
                </div>
                <div className="library-heading">
                  <div>
                    <h2>{folder.split("/").pop() || library.name}</h2>
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
                      Access is limited to colleagues involved in the relevant
                      review and decision-making.
                    </p>
                    <div className="access-help">
                      <p>
                        Need access? Contact <strong>{accessContact}</strong>,
                        Planning Coordinator.
                      </p>
                      <p>
                        If urgent,{" "}
                        <button
                          className="text-link"
                          onClick={() =>
                            window.location.assign(accessRequestHref(folder))
                          }
                        >
                          click here to submit an access request to IT
                        </button>
                        .
                      </p>
                    </div>
                    <Button
                      appearance="primary"
                      onClick={() => navigate("planning")}
                    >
                      Return to Planning Cycles
                    </Button>
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
                          Copy link
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
                        {folderMode
                          ? `${folders.length} folders${displayRows.length ? ` · ${documentCount(displayRows.length)}` : ""}`
                          : documentCount(rows.length)}
                      </span>
                      {(search || activeFilters > 0) && (
                        <button
                          onClick={() => {
                            setSearch("");
                            updateFilters(emptyFilters);
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
                                  updateFilters({
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
                            updateFilters(emptyFilters);
                            setSearch("");
                          }}
                        >
                          Clear filters
                        </Button>
                      </div>
                    )}
                    {folderMode && folders.length > 0 && (
                      <div className="folder-list">
                        {folders.map((f) => (
                          <button
                            key={f.path}
                            onClick={() => navigate(page, f.path)}
                          >
                            <Folder24Regular />
                            <strong>{f.name}</strong>
                            <span>
                              {childFolders(scoped, f.path).length
                                ? `${childFolders(scoped, f.path).length} folders`
                                : documentCount(
                                    browseDocuments(scoped, f.path).length,
                                  )}
                            </span>
                            <ArrowRight20Regular />
                          </button>
                        ))}
                      </div>
                    )}
                    {displayRows.length > 0 && documentTable(displayRows)}
                    {!displayRows.length &&
                      (!folderMode || !folders.length) && (
                        <div className="empty-state">
                          <Search20Regular />
                          <h3>No documents match</h3>
                          <p>
                            Try another view or clear your search and filters.
                          </p>
                          <Button
                            onClick={() => {
                              setSearch("");
                              updateFilters(emptyFilters);
                              setView("All Documents");
                            }}
                          >
                            Show all documents
                          </Button>
                        </div>
                      )}
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
                {selected.folderPath || selected.cycle}
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
              {modal === "about"
                ? "About this prototype"
                : modal === "milestones"
                  ? "2027 Annual Planning milestones"
                  : "Version history"}
            </DialogTitle>
            <DialogContent>
              {modal === "about" ? (
                <p>This prototype uses fictional content.</p>
              ) : modal === "milestones" ? (
                <>
                  <span className="open-status">
                    <span />
                    Open for contributions
                  </span>
                  <ol className="milestone-list">
                    {milestones.map(([name, date], i) => (
                      <li key={name}>
                        <span className={i === 0 ? "milestone-done" : ""}>
                          {i === 0 ? (
                            <CheckmarkCircle24Regular />
                          ) : (
                            <Calendar20Regular />
                          )}
                        </span>
                        <div>
                          <strong>{name}</strong>
                          <span>{date}</span>
                        </div>
                      </li>
                    ))}
                  </ol>
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
