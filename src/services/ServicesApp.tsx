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
  ArrowRight20Regular,
  ArrowUpRight20Regular,
  LockClosed20Regular,
  Dismiss20Regular,
  Search20Regular,
  Link20Regular,
  Document20Regular,
} from "@fluentui/react-icons";
import WorkspaceHeader from "../logistics/WorkspaceHeader";
import DocumentIcon from "../components/DocumentIcon";
import {
  areas,
  title,
  purpose,
  description,
  documents,
  filesById,
  sharedReferences,
  matters,
  matterHref,
  systems,
  systemHref,
  directory,
  handoffs,
  priorities,
  recentIds,
  savedViews,
  queryDocuments,
  type ServiceFile,
} from "./data";
import "./styles.css";
const areaHref = (id: string) => `/services/${id}`;
const fileHref = (id: string) => {
  const f = filesById.get(id)!;
  return `${areaHref(f.area)}?document=${id}`;
};
export default function ServicesApp() {
  const parts = location.pathname.split("/").filter(Boolean);
  const page = parts[1] || "home";
  const area = areas.find((a) => a.id === page);
  const legacySystems: Record<string, string> = {
    jira: "freshservice",
    "business-central": "netsuite",
    docuware: "m-files",
    recruitment: "greenhouse",
  };
  const systemId = legacySystems[parts[2]] || parts[2];
  const system =
    page === "systems" ? systems.find((s) => s.id === systemId) : undefined;
  const matter =
    parts.length === 4
      ? matters.find((m) => matterHref(m) === location.pathname)
      : undefined;
  const unknown =
    (page !== "home" && !area && !system) ||
    (parts.length > 2 && !system && !matter);
  const params = new URLSearchParams(location.search);
  const [selected, setSelected] = useState<ServiceFile | undefined>(() =>
    filesById.get(params.get("document") || ""),
  );
  const [scenario, setScenario] = useState<string | null>(
    params.get("handoff"),
  );
  const [search, setSearch] = useState("");
  const [view, setView] = useState("All Documents");
  const [workType, setWorkType] = useState("");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const folder = params.get("folder") || "";
  const activeScenario = handoffs.find((h) => h.id === scenario);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 4500);
    return () => clearTimeout(timer);
  }, [message]);
  const openFile = (f: ServiceFile) => {
    setSelected(f);
  };
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Link copied.");
    } catch {
      setMessage("Use the browser address to share this view.");
    }
  };
  const rows = area
    ? queryDocuments(area.id, folder, view, search, workType)
    : [];
  const discovering = !!(
    search ||
    workType ||
    view !== "All Documents" ||
    folder ||
    page === "resources"
  );
  const shownMatters = matters.filter((m) => m.area === page);
  return (
    <div className="app-shell services-app">
      <a className="skip-link" href="#services-main">
        Skip to content
      </a>
      <WorkspaceHeader
        title={title}
        searchFiles={documents}
        memberCount={28}
        helpText={purpose}
        onOpen={(f) => openFile(filesById.get(f.id)!)}
        onTeams={() => location.assign(systemHref("m365"))}
        onMessage={setMessage}
      />
      <div className="workspace">
        <aside className="sidebar services-sidebar">
          <nav aria-label="Services workspace navigation">
            <a
              href="/services"
              aria-current={page === "home" ? "page" : undefined}
            >
              <Home24Regular />
              Home
            </a>
            <span className="service-nav-label">INTERNAL SERVICES</span>
            {areas.map((a) => (
              <a
                key={a.id}
                href={areaHref(a.id)}
                aria-current={page === a.id ? "page" : undefined}
              >
                <Folder24Regular />
                {a.name}
              </a>
            ))}
          </nav>
        </aside>
        <main id="services-main" className="services-main">
          <div className="breadcrumb">
            <a href="/services">Workspace</a>
            {page !== "home" && (
              <>
                {" "}
                /{" "}
                <a href={area ? areaHref(area.id) : "/services"}>
                  {area?.name || "Service systems"}
                </a>
              </>
            )}
            {folder && <> / {folder}</>}
            {matter && <> / {matter.id}</>}
          </div>
          {unknown ? (
            <section className="service-restricted">
              <h2>Page not found</h2>
              <p>
                This address is not part of the Organisation Services example.
              </p>
              <a href="/services">Return to Organisation Services</a>
            </section>
          ) : system ? (
            <section className="system-destination">
              <span className="external-system-label">
                <ArrowUpRight20Regular /> EXTERNAL BUSINESS SYSTEM · SIMULATED
                DESTINATION
              </span>
              <h2>{system.name}</h2>
              <p>
                This would open the organisation’s{" "}
                {system.id === "netsuite"
                  ? "finance and purchasing system"
                  : system.id === "m-files"
                    ? "controlled document and workflow system"
                    : system.id === "greenhouse"
                      ? "recruitment and candidate workflow system"
                      : system.id === "asana"
                        ? "project and task coordination system"
                        : "Microsoft 365 collaboration tools"}
                .
              </p>
              <p>{system.purpose}.</p>
              <p className="service-muted">
                Demonstration only. No external account is opened and no data is
                transferred.
              </p>
              <Button onClick={() => location.assign("/services")}>
                Return to Organisation Services
              </Button>
              {system.id === "m365" && (
                <a href="/logistics/teams?channel=general&tab=Posts">
                  Explore the existing Teams example <ArrowRight20Regular />
                </a>
              )}
            </section>
          ) : matter ? (
            <section className="service-restricted">
              <LockClosed20Regular />
              <span className="library-label">Protected matter</span>
              <h2>{matter.name}</h2>
              <p>
                This matter has a narrower access group because it contains
                information requiring restricted handling.
              </p>
              <p>
                You are signed in as Maya Chen, an Organisation Services member.
                Contact fictional service owner Sam Patel if you need access.
              </p>
              <a
                className="service-primary-link"
                href={
                  "/service-desk/access-request?" +
                  new URLSearchParams({
                    workspace: title,
                    area: area!.name,
                    location: `${title} / ${area!.name} / ${matter.name} (${matter.id})`,
                  })
                }
              >
                Submit an access request to IT <ArrowRight20Regular />
              </a>
              <a href={areaHref(matter.area)}>Back to {area!.name}</a>
            </section>
          ) : page === "home" ? (
            <>
              <div className="library-heading">
                <div>
                  <h2>{title}</h2>
                  <p>{description}</p>
                </div>
              </div>
              <section className="service-section">
                <h3>Service systems</h3>
                <SystemTiles />
              </section>
              <div className="services-home-layout">
                <div>
                  <section className="service-section">
                    <div className="service-section-heading">
                      <h3>Cross-service handoffs</h3>
                      <a href="/services/coordination">
                        See all <ArrowRight20Regular />
                      </a>
                    </div>
                    <HandoffList
                      items={handoffs.slice(0, 4)}
                      onSelect={setScenario}
                    />
                  </section>
                  <section className="service-section">
                    <h3>Service areas</h3>
                    <div className="service-area-links">
                      {areas
                        .filter(
                          (a) =>
                            a.id !== "coordination" && a.id !== "resources",
                        )
                        .map((a) => (
                          <a href={areaHref(a.id)} key={a.id}>
                            <Folder24Regular />
                            <span>
                              <strong>{a.name}</strong>
                              <small>{a.summary}</small>
                            </span>
                            <ArrowRight20Regular />
                          </a>
                        ))}
                    </div>
                  </section>
                </div>
                <aside className="services-home-aside">
                  <section>
                    <h3>Useful provider links</h3>
                    <a href="/services/coordination#directory">
                      Service Directory
                    </a>
                    <a href={fileHref("service-owner")}>Service owner guide</a>
                    <a href={fileHref("handover")}>Common handover checklist</a>
                    <a href="/services/resources">Shared Resources</a>
                  </section>
                  <section>
                    <h3>Recent service documents</h3>
                    {recentIds.map((id) => {
                      const f = filesById.get(id)!;
                      return (
                        <button key={id} onClick={() => openFile(f)}>
                          <DocumentIcon name={f.name} />
                          <span>
                            {f.name}
                            <small>{f.campaign}</small>
                          </span>
                        </button>
                      );
                    })}
                  </section>
                  <section>
                    <h3>Current service priorities</h3>
                    <ul>
                      {priorities.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </section>
                </aside>
              </div>
            </>
          ) : page === "coordination" ? (
            <>
              <div className="library-heading">
                <div>
                  <h2>Service Coordination</h2>
                  <p>{area!.summary}</p>
                </div>
              </div>
              <section className="service-section">
                <h3>Cross-service handoffs</h3>
                <HandoffList items={handoffs} onSelect={setScenario} />
                <p className="service-muted">
                  Coordination examples only. Requests and transactions remain
                  in the linked service systems.
                </p>
              </section>
              <section className="service-section" id="directory">
                <h3>Service Directory</h3>
                <Input
                  contentBefore={<Search20Regular />}
                  aria-label="Search service directory"
                  placeholder="Find a service, owner or request route"
                  value={search}
                  onChange={(_, d) => setSearch(d.value)}
                />
                <div className="table-scroll">
                  <table className="service-table">
                    <thead>
                      <tr>
                        {[
                          "Service",
                          "What it supports",
                          "Primary service area",
                          "Request route / system",
                          "Service owner",
                          "Typical handoff",
                          "Status",
                        ].map((c) => (
                          <th key={c}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {directory
                        .filter((d) =>
                          `${d.service} ${d.supports} ${d.owner} ${d.route}`
                            .toLowerCase()
                            .includes(search.toLowerCase()),
                        )
                        .map((d) => (
                          <tr key={d.service}>
                            <td>{d.service}</td>
                            <td>{d.supports}</td>
                            <td>
                              <a href={areaHref(d.area)}>
                                {areas.find((a) => a.id === d.area)!.name}
                              </a>
                            </td>
                            <td>
                              <a href={systemHref(d.system)}>
                                {d.route} <ArrowUpRight20Regular />
                              </a>
                              <small>
                                {systems.find((s) => s.id === d.system)!.name}
                              </small>
                            </td>
                            <td>{d.owner}</td>
                            <td>{d.handoff}</td>
                            <td>Active</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section className="service-section">
                <h3>Current coordination items</h3>
                <p>
                  New software supplier: purchasing and legal input needed. New
                  starter setup: technology readiness is the next step.
                </p>
                <a href="/services/resources">
                  Use common service standards and handover resources{" "}
                  <ArrowRight20Regular />
                </a>
              </section>
            </>
          ) : area ? (
            <>
              <div className="library-heading">
                <div>
                  <h2>{area.name}</h2>
                  <p>{area.summary}</p>
                </div>
                <a className="library-label" href="/services/coordination">
                  Service Directory <ArrowRight20Regular />
                </a>
              </div>
              <div className="service-related">
                <a href="/services/resources">Shared Resources</a>
                <a href="/services/coordination">Cross-service handoffs</a>
                {(page === "technology"
                  ? ["freshservice"]
                  : page === "procurement"
                    ? ["netsuite", "m-files"]
                    : page === "hiring"
                      ? ["greenhouse"]
                      : page === "legal"
                        ? ["m-files"]
                        : []
                ).map((id) => (
                  <a key={id} href={systemHref(id)}>
                    {systems.find((s) => s.id === id)!.name}
                    <ArrowUpRight20Regular />
                  </a>
                ))}
              </div>
              <div className="service-library-toolbar">
                <label>
                  Saved view
                  <select
                    aria-label="Saved view"
                    value={view}
                    onChange={(e) => setView(e.target.value)}
                  >
                    {savedViews.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Work type
                  <select
                    aria-label="Work type"
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                  >
                    <option value="">All work types</option>
                    {[...new Set(documents.map((d) => d.workType))].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <Input
                  contentBefore={<Search20Regular />}
                  placeholder="Search this library"
                  aria-label="Search this library"
                  value={search}
                  onChange={(_, d) => setSearch(d.value)}
                />
                <Button
                  icon={<Link20Regular />}
                  onClick={() => copy(location.href)}
                >
                  Copy link
                </Button>
              </div>
              {!discovering ? (
                <>
                  <div className="service-folder-list">
                    {area.folders.map((f) => (
                      <a
                        key={f}
                        href={`${areaHref(area.id)}?folder=${encodeURIComponent(f)}`}
                      >
                        <Folder24Regular />
                        <span>
                          {f}
                          <small>
                            {documents.filter(
                              (d) => d.area === area.id && d.folder === f,
                            ).length || "Shared"}{" "}
                            {documents.some(
                              (d) => d.area === area.id && d.folder === f,
                            )
                              ? "document"
                              : "resource"}
                          </small>
                        </span>
                        <ArrowRight20Regular />
                      </a>
                    ))}
                  </div>
                  {page === "legal" && (
                    <a href={fileHref("risk-assessment")}>
                      Open the shared risk assessment template
                    </a>
                  )}
                </>
              ) : (
                <>
                  <p className="service-muted">
                    {rows.length} documents{" "}
                    {page === "resources" ? "across internal services" : ""}
                  </p>
                  <div className="table-scroll">
                    <table className="service-table service-files">
                      <thead>
                        <tr>
                          {[
                            "Name",
                            "Service area",
                            "Work type",
                            "Status",
                            "Owner",
                            "Modified",
                          ].map((c) => (
                            <th key={c}>{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((f) => (
                          <tr key={f.id}>
                            <td>
                              <button onClick={() => openFile(f)}>
                                <DocumentIcon name={f.name} />
                                {f.name}
                              </button>
                            </td>
                            <td>{f.campaign}</td>
                            <td>{f.workType}</td>
                            <td>{f.status}</td>
                            <td>{f.owner}</td>
                            <td>14 Oct 2026</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!rows.length && (
                      <p className="empty-state">
                        No documents match this view. Try another view or find
                        reusable material in Shared Resources.
                      </p>
                    )}
                  </div>
                </>
              )}
              {sharedReferences[page]?.length > 0 && (
                <section className="service-section">
                  <h3>Shared resources used here</h3>
                  <div className="service-resource-links">
                    {sharedReferences[page].map((id) => {
                      const f = filesById.get(id)!;
                      return (
                        <button key={id} onClick={() => openFile(f)}>
                          <Document20Regular />
                          {f.name}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
              <section className="service-section">
                <h3>Connected service work</h3>
                <HandoffList
                  items={handoffs.filter((h) =>
                    h.steps.some((s) => s.area === page),
                  )}
                  onSelect={setScenario}
                />
              </section>
              {shownMatters.length > 0 && (
                <section className="service-section protected-topic-list">
                  <h3>
                    {page === "hiring"
                      ? "Protected candidate work"
                      : "Protected matters"}
                  </h3>
                  <p className="service-muted">
                    Access is specific to each matter. Shared guidance and
                    templates remain available above.
                  </p>
                  {shownMatters.map((m) => (
                    <a key={m.id} href={matterHref(m)}>
                      <LockClosed20Regular />
                      {m.name}
                      <span>Narrower access group</span>
                    </a>
                  ))}
                </section>
              )}
            </>
          ) : null}
        </main>
      </div>
      <Drawer
        open={!!selected}
        onOpenChange={(_, d) => {
          if (!d.open) setSelected(undefined);
        }}
        position="end"
        size="medium"
        modalType="modal"
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                icon={<Dismiss20Regular />}
                aria-label="Close details"
                onClick={() => setSelected(undefined)}
              />
            }
          >
            Details
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          {selected && (
            <>
              <DocumentIcon name={selected.name} />
              <h3>{selected.name}</h3>
              <p>
                {selected.campaign} / {selected.folder}
              </p>
              <Button appearance="primary" onClick={() => setPreview(true)}>
                Open
              </Button>{" "}
              <Button
                onClick={() => copy(location.origin + fileHref(selected.id))}
              >
                Copy link
              </Button>
              <h4>Properties</h4>
              <dl className="service-properties">
                {[
                  ["Service area", selected.campaign],
                  ["Work type", selected.workType],
                  ["Status", selected.status],
                  ["Owner", selected.owner],
                  ["System reference", selected.reference || "—"],
                  ["Sensitivity", selected.sensitivity],
                  ["Record state", selected.recordState],
                  ["Modified", "14 Oct 2026"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              {selected.reference && (
                <p className="service-muted">
                  Reference only. Authoritative transactions and records remain
                  in their service system.
                </p>
              )}
              <a href={areaHref(selected.area)}>
                Go to service area <ArrowRight20Regular />
              </a>
            </>
          )}
        </DrawerBody>
      </Drawer>
      <Drawer
        open={!!activeScenario}
        onOpenChange={(_, d) => {
          if (!d.open) setScenario(null);
        }}
        position="end"
        size="medium"
        modalType="modal"
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                icon={<Dismiss20Regular />}
                aria-label="Close handoff"
                onClick={() => setScenario(null)}
              />
            }
          >
            Cross-service handoff
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          {activeScenario && (
            <>
              <span className="library-label">
                {activeScenario.id} · {activeScenario.status}
              </span>
              <h3>{activeScenario.name}</h3>
              <p>{activeScenario.summary}</p>
              <p>
                <strong>Next step owner:</strong> {activeScenario.next}
              </p>
              <ol className="service-scenario-steps">
                {activeScenario.steps.map((s, i) => (
                  <li key={i}>
                    <a href={areaHref(s.area)}>
                      {areas.find((a) => a.id === s.area)!.name}
                    </a>
                    <p>{s.text}</p>
                    <a href={fileHref(s.file)}>
                      {filesById.get(s.file)!.name} <ArrowRight20Regular />
                    </a>
                  </li>
                ))}
              </ol>
              {activeScenario.id === "SERV-118" && (
                <a href={matterHref(matters.find((m) => m.id === "REC-221")!)}>
                  <LockClosed20Regular />
                  Candidate assessment — authorised hiring group only
                </a>
              )}
              <h4>External references</h4>
              {activeScenario.refs.length ? (
                activeScenario.refs.map((r) => (
                  <a
                    className="service-reference"
                    key={r.id}
                    href={systemHref(r.system)}
                  >
                    {r.id} · {systems.find((s) => s.id === r.system)!.name}
                    <ArrowUpRight20Regular />
                  </a>
                ))
              ) : (
                <p>No external references needed.</p>
              )}
              <p className="service-muted">
                Illustrative coordination only; full tickets, applications and
                transactions are held in the relevant systems.
              </p>
            </>
          )}
        </DrawerBody>
      </Drawer>
      <Dialog open={preview} onOpenChange={(_, d) => setPreview(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogContent>
              This is a fictional document preview. No Office file is stored or
              downloaded. Use its properties and source links to explore the
              service workflow.
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreview(false)}>Close</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      {message && (
        <div className="toast" role="status">
          {message}
        </div>
      )}
    </div>
  );
}
function SystemTiles() {
  return (
    <div className="service-system-tiles">
      {systems.map((s) => (
        <a href={systemHref(s.id)} key={s.id}>
          <span className="system-wordmark" style={{ color: s.color }}>
            {s.name}
          </span>
          <small>{s.purpose}</small>
          <span className="system-launch">
            Open system <ArrowUpRight20Regular />
          </span>
        </a>
      ))}
    </div>
  );
}
function HandoffList({
  items,
  onSelect,
}: {
  items: typeof handoffs;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="service-handoff-list">
      {items.map((h) => (
        <button key={h.id} onClick={() => onSelect(h.id)}>
          <span>
            <strong>{h.name}</strong>
            <small>{h.path}</small>
            <small>Next: {h.next}</small>
          </span>
          <span className="handoff-status">
            {h.status}
            <small>{h.id}</small>
          </span>
          <ArrowRight20Regular />
        </button>
      ))}
    </div>
  );
}
