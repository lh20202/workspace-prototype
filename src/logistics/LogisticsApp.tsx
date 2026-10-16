import { RotaView, CalendarView } from "./OperationalSchedule";
import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@fluentui/react-components";
import {
  Home24Regular,
  Folder24Regular,
  Location24Regular,
  Library24Regular,
  LearningApp24Regular,
  CheckmarkCircle24Regular,
  Search20Regular,
  Add20Regular,
  ArrowUpload20Regular,
  Link20Regular,
  Filter20Regular,
  ChevronDown16Regular,
  ArrowRight20Regular,
  PeopleTeam24Regular,
  Dismiss20Regular,
  Info20Regular,
  History20Regular,
  Document24Regular,
  Calendar24Regular,
  Call24Regular,
  People24Regular,
} from "@fluentui/react-icons";
import DocumentIcon from "../components/DocumentIcon";
import WorkspaceHeader from "./WorkspaceHeader";
import FileTable, { FileStatus, shortDate } from "./FileTable";
import LocationsList from "./LocationsList";
import TeamsView from "./TeamsView";
import { staff, selectedStaffId } from "../intranet/catalog";
import { canSeeLogisticsChannel } from "../teams/visibility";
import {
  files,
  filesById,
  libraries,
  campaigns,
  quickLinks,
  channels,
  workspaceTitle,
  workspacePurpose,
  type OperationalFile,
} from "./data";
import {
  queryFiles,
  emptyFilters,
  savedViews,
  fileHref,
  type SavedView,
  type FileFilters,
} from "./query";
export function logisticsRoute() {
  const parts = location.pathname.split("/").filter(Boolean);
  const params = new URLSearchParams(location.search);
  return {
    page: parts[1] ?? "home",
    folder: params.get("folder") ?? "",
    view: savedViews.includes(params.get("view") as SavedView)
      ? (params.get("view") as SavedView)
      : ("All Documents" as SavedView),
    channel: params.get("channel") ?? "central-city",
    tab: params.get("tab") ?? "Posts",
    filters: {
      campaign: params.get("campaign") ?? "",
      operation: params.get("operation") ?? "",
      type: params.get("type") ?? "",
      status: params.get("status") ?? "",
    },
  };
}
function documentFromLocation() {
  const params = new URLSearchParams(location.search);
  const file = filesById.get(params.get("document") || "");
  if (!file || !location.pathname.endsWith("/teams")) return file || null;
  const person =
    staff.find((s) => s.id === (params.get("staff") || selectedStaffId())) ||
    staff[1];
  const channel = channels.find(
    (c) => c.id === (params.get("channel") || "general"),
  );
  return channel &&
    canSeeLogisticsChannel(person, channel) &&
    channel.fileIds.includes(file.id)
    ? file
    : null;
}
export default function LogisticsApp() {
  const [route, setRoute] = useState(logisticsRoute);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FileFilters>(route.filters);
  const [filtersOpen, setFiltersOpen] = useState(
    Object.values(route.filters).some(Boolean),
  );
  const [selected, setSelected] = useState<OperationalFile | null>(
    documentFromLocation,
  );
  const [toast, setToast] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sort, setSort] = useState<keyof OperationalFile>("name");
  const [descending, setDescending] = useState(false);
  useEffect(() => {
    const listener = () => {
      const next = logisticsRoute();
      setRoute(next);
      setFilters(next.filters);
      setFiltersOpen(Object.values(next.filters).some(Boolean));
      setSearch("");
      setSelected(documentFromLocation());
      setHistoryOpen(false);
    };
    window.addEventListener("popstate", listener);
    return () => window.removeEventListener("popstate", listener);
  }, []);
  useEffect(() => {
    document.title =
      route.page === "teams" ? `${workspaceTitle} | Teams` : workspaceTitle;
  }, [route.page]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  function navigate(page: string, params: Record<string, string> = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => !!v),
    );
    if (page === "teams")
      query.set(
        "staff",
        new URLSearchParams(location.search).get("staff") || selectedStaffId(),
      );
    history.pushState(
      {},
      "",
      `/logistics${page === "home" ? "" : `/${page}`}${query.size ? "?" + query : ""}`,
    );
    window.dispatchEvent(new Event("workspace:navigation"));
    window.scrollTo({ top: 0, behavior: "instant" });
    const next = logisticsRoute();
    setRoute(next);
    setFilters(next.filters);
    setFiltersOpen(Object.values(next.filters).some(Boolean));
    setSearch("");
    setSelected(documentFromLocation());
    setHistoryOpen(false);
  }
  function updateFilters(next: FileFilters) {
    setFilters(next);
    const params = new URLSearchParams(location.search);
    for (const [k, v] of Object.entries(next))
      if (v) params.set(k, v);
      else params.delete(k);
    history.replaceState(
      {},
      "",
      `${location.pathname}${params.size ? "?" + params : ""}`,
    );
  }
  function openFile(file: OperationalFile) {
    setSelected(file);
  }
  function openFromHome(file: OperationalFile) {
    navigate(file.library, { folder: file.folder, document: file.id });
  }
  const library = libraries.find((l) => l.id === route.page);
  const scoped = files.filter((f) => f.library === route.page);
  const rows = queryFiles(
    scoped,
    route.view,
    search,
    filters,
    route.folder,
    sort,
    descending,
  );
  const folderMode =
    route.view === "All Documents" &&
    !search.trim() &&
    !Object.values(filters).some(Boolean);
  const folders =
    route.page === "operations" && !route.folder && folderMode
      ? [...new Set(scoped.map((f) => f.folder))].filter(Boolean)
      : [];
  const displayRows = folders.length ? rows.filter((f) => !f.folder) : rows;
  const libraryIcons = {
    operations: Folder24Regular,
    resources: Library24Regular,
    training: LearningApp24Regular,
    records: CheckmarkCircle24Regular,
  };
  return (
    <div className="app-shell logistics-shell">
      <a
        className="skip-link"
        href={route.page === "teams" ? "#teams-main" : "#logistics-main"}
      >
        Skip to content
      </a>
      {route.page === "teams" ? (
        <TeamsView
          channelId={route.channel}
          activeTab={route.tab}
          onNavigate={(channel, tab) => navigate("teams", { channel, tab })}
          onOpenFile={openFile}
          onWorkspace={() => navigate("home")}
          onMessage={setToast}
        />
      ) : (
        <>
          <WorkspaceHeader
            onOpen={openFromHome}
            onTeams={() => navigate("teams", { channel: "general" })}
            onMessage={setToast}
          />
          <div className="workspace">
            <aside className="sidebar">
              <nav aria-label="Logistics workspace navigation">
                <button
                  className={route.page === "home" ? "nav-active" : ""}
                  aria-current={route.page === "home" ? "page" : undefined}
                  onClick={() => navigate("home")}
                >
                  <Home24Regular />
                  Home
                </button>
                <div className="nav-section">OPERATIONS & SUPPORT</div>
                {libraries.slice(0, 1).map((l) => (
                  <button
                    key={l.id}
                    className={
                      route.page === l.id ||
                      (route.page === "rota" && l.id === "operations")
                        ? "nav-active"
                        : ""
                    }
                    onClick={() => navigate(l.id)}
                  >
                    <Folder24Regular />
                    {l.name}
                  </button>
                ))}
                <button
                  className={route.page === "locations" ? "nav-active" : ""}
                  onClick={() => navigate("locations")}
                >
                  <Location24Regular />
                  Locations & Permits
                </button>
                <button
                  className={route.page === "calendar" ? "nav-active" : ""}
                  onClick={() => navigate("calendar")}
                >
                  <Calendar24Regular />
                  Shared calendar
                </button>
                {libraries.slice(1).map((l) => {
                  const Icon = libraryIcons[l.id];
                  return (
                    <button
                      key={l.id}
                      className={route.page === l.id ? "nav-active" : ""}
                      onClick={() => navigate(l.id)}
                    >
                      <Icon />
                      {l.name}
                    </button>
                  );
                })}
              </nav>
              <div className="sidebar-footer">
                <button
                  onClick={() => navigate("teams", { channel: "general" })}
                >
                  <PeopleTeam24Regular />
                  Open Teams channels
                </button>
              </div>
            </aside>
            <main className="main-content" id="logistics-main">
              {route.page === "home" ? (
                <div className="home-layout logistics-home">
                  <div className="home-main">
                    <div className="page-heading">
                      <h2>{workspaceTitle}</h2>
                      <p>{workspacePurpose}</p>
                    </div>
                    <div
                      className="operational-shortcuts"
                      aria-label="Operational shortcuts"
                    >
                      <Button
                        icon={<Calendar24Regular />}
                        onClick={() => navigate("rota", { type: "street" })}
                      >
                        In-person rota
                      </Button>
                      <Button
                        icon={<Call24Regular />}
                        onClick={() => navigate("rota", { type: "telephone" })}
                      >
                        Calling rota
                      </Button>
                      <Button
                        icon={<People24Regular />}
                        onClick={() =>
                          navigate("teams", {
                            channel: "coaches",
                            tab: "Planner",
                          })
                        }
                      >
                        Coach & team lead planner
                      </Button>
                      <Button
                        icon={<Calendar24Regular />}
                        onClick={() => navigate("calendar")}
                      >
                        Shared calendar
                      </Button>
                    </div>
                    <section className="current-operations">
                      <div className="section-heading">
                        <h3>Current operations</h3>
                        <span className="muted">Week 42 · 14 October 2026</span>
                      </div>
                      {campaigns.map((c) => (
                        <button
                          key={c.name}
                          onClick={() =>
                            navigate("operations", { campaign: c.name })
                          }
                        >
                          <span>
                            <strong>{c.name}</strong>
                            <small>{c.operation}</small>
                          </span>
                          <span
                            className={`operation-state ${c.status.toLowerCase()}`}
                          >
                            {c.status}
                          </span>
                          <ArrowRight20Regular />
                        </button>
                      ))}
                    </section>
                    <section className="quick-links-section">
                      <div className="section-heading">
                        <h3>Quick links</h3>
                      </div>
                      <div className="quick-links logistics-quick-links">
                        {quickLinks.map((link) => (
                          <button
                            key={link.label}
                            onClick={() => {
                              if (link.id)
                                openFromHome(filesById.get(link.id)!);
                              else navigate(link.page!);
                            }}
                          >
                            <span className="quick-link-icon">
                              {link.page ? (
                                <Location24Regular />
                              ) : (
                                <Document24Regular />
                              )}
                            </span>
                            <span>{link.label}</span>
                          </button>
                        ))}
                      </div>
                    </section>
                    <section className="recent">
                      <div className="section-heading">
                        <h3>Recent operational files</h3>
                        <button onClick={() => navigate("operations")}>
                          See all <ArrowRight20Regular />
                        </button>
                      </div>
                      <div className="recent-list">
                        {[
                          "central-deployment",
                          "travel-itinerary",
                          "telephone-handover",
                          "packing-list",
                        ].map((id) => {
                          const f = filesById.get(id)!;
                          return (
                            <button key={id} onClick={() => openFromHome(f)}>
                              <DocumentIcon name={f.name} />
                              <span className="recent-name">
                                {f.name}
                                <small>
                                  {
                                    libraries.find((l) => l.id === f.library)
                                      ?.name
                                  }{" "}
                                  · {f.campaign}
                                </small>
                              </span>
                              <span className="recent-date">
                                {shortDate(f.modified)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  </div>
                  <aside className="home-aside">
                    <section className="teams-entry">
                      <div className="teams-entry-icon">
                        <img
                          src="/images/teams-logo.svg"
                          alt="Microsoft Teams"
                        />
                        <span>Microsoft Teams</span>
                      </div>
                      <h3>Your day-to-day coordination</h3>
                      <p>
                        Share updates, discuss handovers and work with the team.
                      </p>
                      <Button
                        appearance="primary"
                        onClick={() =>
                          navigate("teams", { channel: "general" })
                        }
                      >
                        Open Teams <ArrowRight20Regular />
                      </Button>
                    </section>
                    <section className="department-jumps channel-jumps">
                      <h3>Teams channels</h3>
                      {channels
                        .filter(
                          (c) => c.team === "logistics" && c.id !== "general",
                        )
                        .slice(0, 6)
                        .map((c) => (
                          <button
                            key={c.id}
                            onClick={() => navigate("teams", { channel: c.id })}
                          >
                            <img
                              className="channel-teams-mark"
                              src="/images/teams-logo.svg"
                              alt=""
                            />
                            <span>{c.name}</span>
                            <ArrowRight20Regular />
                          </button>
                        ))}
                    </section>
                    <section className="home-reference">
                      <h3>Operational reference</h3>
                      <button onClick={() => navigate("resources")}>
                        <Library24Regular />
                        Shared operations guides
                      </button>
                      <button onClick={() => navigate("records")}>
                        <CheckmarkCircle24Regular />
                        Completed campaign records
                      </button>
                    </section>
                  </aside>
                </div>
              ) : (
                <>
                  <div className="breadcrumb">
                    <button onClick={() => navigate("home")}>Workspace</button>
                    <span>/</span>
                    <button
                      onClick={() =>
                        navigate(
                          route.page === "rota" ? "operations" : route.page,
                        )
                      }
                    >
                      {route.page === "calendar"
                        ? "Shared calendar"
                        : route.page === "rota"
                          ? "Campaign Operations"
                          : route.page === "locations"
                            ? "Locations & Permits"
                            : (library?.name ?? "Workspace")}
                    </button>
                    {route.folder && (
                      <>
                        <span>/</span>
                        <span>{route.folder}</span>
                      </>
                    )}
                  </div>
                  {route.page === "rota" ? (
                    <RotaView
                      type={
                        new URLSearchParams(location.search).get("type") ===
                        "telephone"
                          ? "telephone"
                          : "street"
                      }
                      onOpen={openFile}
                    />
                  ) : route.page === "calendar" ? (
                    <CalendarView onOpen={openFile} onNavigate={navigate} />
                  ) : route.page === "locations" ? (
                    <LocationsList onMessage={setToast} />
                  ) : library ? (
                    <>
                      <div className="library-heading">
                        <div>
                          <h2>{route.folder || library.name}</h2>
                          <p>{library.description}</p>
                        </div>
                        <span
                          className={`library-label ${route.page === "records" ? "final-label" : ""}`}
                        >
                          {route.page === "records" ? (
                            <CheckmarkCircle24Regular />
                          ) : (
                            <Document24Regular />
                          )}
                          {route.page === "records"
                            ? "Final records"
                            : route.page === "resources"
                              ? "Current standards"
                              : "Working information"}
                        </span>
                      </div>
                      {route.page === "records" && (
                        <div className="record-banner">
                          <CheckmarkCircle24Regular />
                          <div>
                            <strong>Selected completed records</strong>
                            <span>
                              Final reports and evidence, available to read.
                              Active working files remain in Campaign
                              Operations.
                            </span>
                          </div>
                          <span className="read-only">Read only</span>
                        </div>
                      )}
                      {route.page === "resources" && (
                        <div className="resource-notice">
                          <Link20Regular />
                          Current shared guides are linked from Teams channels.
                        </div>
                      )}
                      <div className="command-bar">
                        <div>
                          {route.page !== "records" && (
                            <>
                              <Button
                                appearance="primary"
                                icon={<Add20Regular />}
                                onClick={() =>
                                  setToast(
                                    "Prototype: a new document would be created with its campaign metadata.",
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
                                    "Prototype: upload a campaign contribution and assign its operational metadata.",
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
                              value={route.view}
                              onChange={(e) =>
                                navigate(route.page, {
                                  view: e.target.value,
                                  ...filters,
                                })
                              }
                            >
                              {savedViews.map((v) => (
                                <option key={v}>{v}</option>
                              ))}
                            </select>
                            <ChevronDown16Regular />
                          </label>
                          <Button
                            appearance="subtle"
                            icon={<Filter20Regular />}
                            aria-expanded={filtersOpen}
                            onClick={() => setFiltersOpen(!filtersOpen)}
                          >
                            Filters
                          </Button>
                        </div>
                      </div>
                      <div className="library-search">
                        <Input
                          contentBefore={<Search20Regular />}
                          placeholder="Search this library"
                          aria-label="Search this library"
                          value={search}
                          onChange={(_, d) => setSearch(d.value)}
                        />
                        <span>
                          {folders.length
                            ? `${folders.length} folders`
                            : `${rows.length} document${rows.length === 1 ? "" : "s"}`}
                        </span>
                        {(search || Object.values(filters).some(Boolean)) && (
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
                      {filtersOpen && (
                        <div className="filter-bar">
                          {(
                            ["campaign", "operation", "type", "status"] as const
                          ).map((key) => (
                            <label key={key}>
                              {
                                {
                                  campaign: "Campaign",
                                  operation: "Operation type",
                                  type: "Document type",
                                  status: "Status",
                                }[key]
                              }
                              <select
                                aria-label={
                                  {
                                    campaign: "Campaign filter",
                                    operation: "Operation type filter",
                                    type: "Document type filter",
                                    status: "Status filter",
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
                                {[...new Set(scoped.map((f) => f[key]))]
                                  .sort()
                                  .map((v) => (
                                    <option key={v}>{v}</option>
                                  ))}
                              </select>
                            </label>
                          ))}
                          <Button
                            onClick={() => {
                              setSearch("");
                              updateFilters(emptyFilters);
                            }}
                          >
                            Clear filters
                          </Button>
                        </div>
                      )}
                      {folders.length > 0 && (
                        <div className="folder-list">
                          {folders.map((f) => (
                            <button
                              key={f}
                              onClick={() =>
                                navigate(route.page, { folder: f })
                              }
                            >
                              <Folder24Regular />
                              <strong>{f}</strong>
                              <span>
                                {scoped.filter((d) => d.folder === f).length}{" "}
                                documents
                              </span>
                              <ArrowRight20Regular />
                            </button>
                          ))}
                        </div>
                      )}
                      {(!folders.length || displayRows.length > 0) && (
                        <FileTable
                          items={displayRows}
                          onOpen={openFile}
                          sort={sort}
                          descending={descending}
                          onSort={(key) => {
                            setSort(key);
                            setDescending(sort === key ? !descending : false);
                          }}
                        />
                      )}
                    </>
                  ) : (
                    <div className="empty-state">
                      <h2>Workspace page not found</h2>
                      <Button onClick={() => navigate("home")}>
                        Return home
                      </Button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </>
      )}
      <Drawer
        type="overlay"
        position="end"
        size="medium"
        open={!!selected && !historyOpen}
        onOpenChange={(_, d) => {
          if (!d.open) setSelected(null);
        }}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                icon={<Dismiss20Regular />}
                aria-label="Close details"
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
                <DocumentIcon name={selected.name} />
                <h3>{selected.name}</h3>
                <FileStatus status={selected.status} />
              </div>
              <p className="detail-location">
                {libraries.find((l) => l.id === selected.library)?.name}
                {selected.folder ? ` / ${selected.folder}` : ""}
              </p>
              <div className="detail-actions">
                <Button
                  appearance="primary"
                  onClick={() =>
                    setToast(
                      "Prototype preview: this fictional file has no stored document.",
                    )
                  }
                >
                  Open
                </Button>
                <Button
                  icon={<Link20Regular />}
                  onClick={() => {
                    void navigator.clipboard
                      .writeText(location.origin + fileHref(selected))
                      .then(
                        () => setToast("Document link copied."),
                        () => setToast("Clipboard unavailable."),
                      );
                  }}
                >
                  Copy link
                </Button>
                <Button
                  icon={<History20Regular />}
                  onClick={() => setHistoryOpen(true)}
                >
                  Version history
                </Button>
              </div>
              {route.page === "teams" && (
                <a className="details-sp-link" href={fileHref(selected)}>
                  Open in SharePoint <ArrowRight20Regular />
                </a>
              )}
              <h4>Properties</h4>
              <dl className="properties">
                {[
                  ["Campaign", selected.campaign],
                  ["Operation type", selected.operation],
                  ["Location", selected.location],
                  ["Document type", selected.type],
                  ["Status", selected.status],
                  ["Owner", selected.owner],
                  ["Valid from", shortDate(selected.validFrom)],
                  ["Valid to", shortDate(selected.validTo)],
                  ["Modified", shortDate(selected.modified)],
                  ["Sensitivity", selected.sensitivity],
                  ["Record state", selected.recordState],
                  ...(selected.library === "records"
                    ? [
                        [
                          "Record category",
                          "Completed campaign operations record",
                        ],
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
        open={historyOpen}
        onOpenChange={(_, d) => {
          if (!d.open) setHistoryOpen(false);
        }}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Version history</DialogTitle>
            <DialogContent>
              <p>{selected?.name}</p>
              <p className="muted">Illustrative history · no stored versions</p>
              <div className="version-list">
                {[
                  ["1.0", "Current published version"],
                  ["0.2", "Operational review incorporated"],
                  ["0.1", "Initial preparation"],
                ].map(([version, note]) => (
                  <div key={version}>
                    <strong>v{version}</strong>
                    <span>
                      {note}
                      <small>{selected?.owner}</small>
                    </span>
                  </div>
                ))}
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                appearance="primary"
                onClick={() => setHistoryOpen(false)}
              >
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
