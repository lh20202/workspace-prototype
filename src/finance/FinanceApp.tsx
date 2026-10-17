import { useState } from "react";
import {
  Button,
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
} from "@fluentui/react-components";
import { Dismiss20Regular, LockClosed20Regular } from "@fluentui/react-icons";
import WorkspaceHeader from "../logistics/WorkspaceHeader";
import DocumentLibrary from "../sharepoint/DocumentLibrary";
import {
  title,
  description,
  areas,
  systems,
  items,
  files,
  protectedSubjects,
  checklist,
  variance,
  calendar,
  type FinancialItem,
} from "./data";
import "../services/styles.css";
import "./styles.css";
const base = "/financial-operations";
import { libraries, libraryFiles, definitions, folderNames } from "./libraries";
export default function FinanceApp() {
  const parts = location.pathname.split("/").filter(Boolean);
  const page = parts[1] || "home",
    subject = parts[2];
  const area = areas.find((a) => a.id === page);
  const library = libraries.find(
    (l) => l.id === page || l.areas.includes(page),
  );
  const system =
    page === "systems" ? systems.find((s) => s.id === subject) : undefined;
  const protectedName = protectedSubjects[page]?.find(
    (s) => s[0] === subject,
  )?.[1];
  const unknown = !!subject && !protectedName && !system;
  const [records, setRecords] = useState(items);
  const [selected, setSelected] = useState<FinancialItem>();
  const [notice, setNotice] = useState("");
  const [checks, setChecks] = useState<string[]>([]);
  const [explanation, setExplanation] = useState("");
  const [savedExplanation, setSavedExplanation] = useState("");
  const [baseline, setBaseline] = useState(false);
  const [query, setQuery] = useState("");
  const [view, setView] = useState("Open issues");
  const rowLink = (id: string) => {
    const x = records.find((r) => r.id === id)!;
    return (
      <button className="finance-text-link" onClick={() => setSelected(x)}>
        {x.name}
      </button>
    );
  };
  const systemLink = (id: string) => {
    const s = systems.find((s) => s.id === id)!;
    return <a href={`${base}/systems/${id}`}>Open in {s.name} ↗</a>;
  };
  const protectedAreas = library?.areas || [];
  const subjects = protectedAreas.flatMap((id) =>
    (protectedSubjects[id] || []).map(([subjectId, name]) => ({
      href: `${base}/${id}/${subjectId}`,
      name,
    })),
  );
  function issuesList() {
    const rows = records.filter(
      (x) =>
        (x.area === "income" || x.area === "reconciliation") &&
        (view !== "Open issues" || !/Complete|Approved/.test(x.status)) &&
        `${x.name} ${x.owner}`.toLowerCase().includes(query.toLowerCase()),
    );
    return (
      <>
        <div className="finance-list-toolbar">
          <select
            aria-label="Reconciliation issue view"
            value={view}
            onChange={(e) => setView(e.target.value)}
          >
            <option>Open issues</option>
            <option>All issues</option>
          </select>
          <input
            aria-label="Search reconciliation issues"
            placeholder="Search this list"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="finance-table-scroll">
          <table>
            <thead>
              <tr>
                {["Issue", "Owner", "Status", "Due"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((x) => (
                <tr key={x.id}>
                  <td>{rowLink(x.id)}</td>
                  <td>{x.owner}</td>
                  <td>{x.status}</td>
                  <td>{x.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }
  function closeChecklist() {
    return (
      <>
        <h1>Close Checklist</h1>
        <p>October 2026</p>
        <div className="finance-checklist">
          {checklist.map((c) => (
            <label key={c}>
              <input
                type="checkbox"
                checked={checks.includes(c)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...checks, c]
                    : checks.filter((x) => x !== c);
                  setChecks(next);
                  setRecords(
                    records.map((x) =>
                      x.id === "ACC-01"
                        ? {
                            ...x,
                            status:
                              next.length === checklist.length
                                ? "Complete"
                                : "Reconciliation",
                          }
                        : x,
                    ),
                  );
                }}
              />
              {c}
            </label>
          ))}
        </div>
        <p>{systemLink("blackline")}</p>
      </>
    );
  }
  const activeName =
    page === "calendar"
      ? "Financial Calendar"
      : page === "close-checklist"
        ? "Close Checklist"
        : page === "reconciliation-issues"
          ? "Reconciliation Issues"
          : page === "restricted"
            ? "Restricted"
            : library?.name || area?.name || system?.name || "Home";
  return (
    <div className="app-shell services-app finance-app">
      <a className="skip-link" href="#finance-main">
        Skip to financial workspace
      </a>
      <WorkspaceHeader
        title={title}
        searchFiles={files}
        memberCount={28}
        onOpen={(f) => {
          const l = libraries.find((x) => x.areas.includes(f.folder));
          if (l)
            location.assign(`${base}/${l.id}?file=${encodeURIComponent(f.id)}`);
        }}
        onMessage={setNotice}
        helpText="Financial working documents, close coordination and planning contributions."
      />
      <div className="workspace-body finance-layout">
        <aside className="sidebar services-sidebar">
          <nav aria-label="Financial workspace navigation">
            <a href={base} aria-current={page === "home" ? "page" : undefined}>
              Home
            </a>
            {libraries.map((l) => (
              <a
                key={l.id}
                href={`${base}/${l.id}`}
                aria-current={library?.id === l.id ? "page" : undefined}
              >
                {l.name}
              </a>
            ))}
            {[
              ["close-checklist", "Close Checklist"],
              ["reconciliation-issues", "Reconciliation Issues"],
              ["calendar", "Financial Calendar"],
              ["restricted", "Restricted"],
            ].map(([id, name]) => (
              <a
                key={id}
                href={`${base}/${id}`}
                aria-current={page === id ? "page" : undefined}
              >
                {id === "restricted" && <LockClosed20Regular />}
                {name}
              </a>
            ))}
          </nav>
        </aside>
        <main
          id="finance-main"
          className={`services-main finance-main${page === "home" ? " finance-home" : ""}`}
        >
          <div className="finance-breadcrumb">
            <a href={base}>Workspace</a> /{" "}
            {protectedName ? "Access required" : activeName}
          </div>
          {notice && (
            <div role="status" className="finance-notice">
              {notice}
              <button onClick={() => setNotice("")}>Dismiss</button>
            </div>
          )}
          {protectedName || unknown ? (
            <section className="finance-protected">
              <LockClosed20Regular />
              <h1>Access denied</h1>
              <h2>{protectedName || "This location is unavailable"}</h2>
              <p>
                Specific authorisation is required. Contact Robin Wells or
                submit an access request.
              </p>
              <a
                href={`/service-desk/access-request?${new URLSearchParams({ workspace: title, area: area?.name || "Financial operations", location: `${title} / ${area?.name} / ${protectedName || "Unavailable location"}` })}`}
              >
                Request access →
              </a>
              <p>
                <a href={`${base}/${page}`}>Return to workspace</a>
              </p>
            </section>
          ) : system ? (
            <section>
              <h1>{system.name}</h1>
              <p>{system.purpose}</p>
              <p>Simulated external destination · {system.ref}</p>
              <a href={base}>Back to workspace</a>
            </section>
          ) : page === "home" ? (
            <>
              <h1>{title}</h1>
              <p className="finance-intro">{description}</p>
              <section>
                <h2>October close preparation</h2>
                <p>
                  Resolve reconciliation questions and confirm contribution
                  owners ahead of the 30 October close.
                </p>
                <a href={`${base}/close-checklist`}>
                  Continue the close checklist →
                </a>
                <p>
                  <a href={`${base}/planning-documents?file=FIN-05`}>
                    2027 budget commentary →
                  </a>
                </p>
              </section>
              <section>
                <h2>Upcoming deadlines</h2>
                {calendar.slice(0, 3).map((e) => (
                  <p key={e.day}>
                    <span>Oct {e.day}</span> · {rowLink(e.item)}
                  </p>
                ))}
                <a href={`${base}/calendar`}>Financial calendar →</a>
              </section>
              <DocumentLibrary
                title="Recently updated documents"
                files={libraries.flatMap(libraryFiles)}
                embedded
              />
            </>
          ) : page === "close-checklist" ? (
            closeChecklist()
          ) : page === "reconciliation-issues" ? (
            <>
              <h1>Reconciliation Issues</h1>
              {issuesList()}
            </>
          ) : page === "restricted" ? (
            <>
              <h1>Restricted</h1>
              <div className="finance-protected-links">
                {Object.entries(protectedSubjects).flatMap(([id, entries]) =>
                  entries.map(([key, name]) => (
                    <a key={`${id}-${key}`} href={`${base}/${id}/${key}`}>
                      <LockClosed20Regular />
                      {name}
                    </a>
                  )),
                )}
              </div>
            </>
          ) : page === "calendar" ? (
            <>
              <h1>Financial Calendar</h1>
              <section>
                <div className="finance-calendar-title">
                  <h2>October 2026</h2>
                </div>
                <div className="finance-calendar">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d) => (
                      <strong key={d}>{d}</strong>
                    ),
                  )}
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 2;
                    return (
                      <div key={i}>
                        {day > 0 && day <= 31 && (
                          <>
                            <span>{day}</span>
                            {calendar
                              .filter((e) => e.day === day)
                              .map((e) => (
                                <button
                                  key={e.title}
                                  onClick={() =>
                                    setSelected(
                                      records.find((x) => x.id === e.item),
                                    )
                                  }
                                >
                                  {e.title}
                                </button>
                              ))}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          ) : library ? (
            <>
              <DocumentLibrary
                key={`${library.id}-${page}`}
                title={library.name}
                definition={definitions[library.id]}
                files={libraryFiles(library)}
                initialFolder={area ? folderNames[area.id] : undefined}
              />
              {library.id === "income-documents" && (
                <p>
                  <a href={`${base}/reconciliation-issues`}>
                    Reconciliation Issues
                  </a>{" "}
                  · {systemLink("blackline")}
                </p>
              )}
              {library.id === "payment-documents" && (
                <p>
                  <a href={`${base}/close-checklist`}>Close Checklist</a> ·{" "}
                  <a href="/services/purchasing">Purchasing & Suppliers ↗</a> ·{" "}
                  {systemLink("netsuite")}
                </p>
              )}
              {library.id === "treasury-documents" && (
                <p>{systemLink("kyriba")}</p>
              )}
              {library.id === "accounting-documents" && (
                <p>{systemLink("netsuite")}</p>
              )}
              {library.id === "planning-documents" && (
                <>
                  <section>
                    <details>
                      <summary>Forecast contributions</summary>
                      <div className="finance-table-scroll">
                        <table>
                          <thead>
                            <tr>
                              {[
                                "Area",
                                "Budget",
                                "Actual",
                                "Variance",
                                "Owner",
                                "Status",
                              ].map((h) => (
                                <th key={h}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {variance.map((v) => (
                              <tr key={v.area}>
                                <td>{v.area}</td>
                                <td>{v.budget}</td>
                                <td>{v.actual}</td>
                                <td>{v.actual - v.budget}</td>
                                <td>{v.owner}</td>
                                <td>
                                  {v.owner === "Maya Chen" && savedExplanation
                                    ? "Provided"
                                    : "Requested"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <label htmlFor="variance-comment">
                        Your explanation · Incoming revenue
                      </label>
                      <textarea
                        id="variance-comment"
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        placeholder="Explain the aggregate variance."
                      />
                      <Button
                        disabled={!explanation.trim()}
                        onClick={() => {
                          setSavedExplanation(explanation.trim());
                          setNotice("Your explanation was saved for review.");
                        }}
                      >
                        Save explanation
                      </Button>
                      {savedExplanation && (
                        <p role="status">Maya Chen: {savedExplanation}</p>
                      )}
                    </details>
                  </section>
                  <section>
                    <details>
                      <summary>Approved budget baseline</summary>
                      <p>
                        {baseline
                          ? "2027 approved baseline · AP-271"
                          : "2026 approved baseline · AP-270"}
                      </p>
                      <Button
                        onClick={() => {
                          setBaseline(true);
                          setRecords(
                            records.map((x) =>
                              x.id === "PLAN-01"
                                ? {
                                    ...x,
                                    status: "Complete",
                                    baseline: "2027 approved baseline · AP-271",
                                  }
                                : x,
                            ),
                          );
                          setNotice(
                            "Budget-owner approval simulated. Approved baseline reference released.",
                          );
                        }}
                        disabled={baseline}
                      >
                        Simulate budget-owner approval
                      </Button>
                      <p>{systemLink("adaptive")}</p>
                    </details>
                  </section>
                </>
              )}
              {subjects.length > 0 && (
                <section>
                  <div className="finance-protected-links">
                    {subjects.map((s) => (
                      <a key={s.href} href={s.href}>
                        <LockClosed20Regular />
                        {s.name}
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <h1>This location is unavailable</h1>
          )}
        </main>
      </div>
      <Drawer
        open={!!selected}
        position="end"
        onOpenChange={(_, d) => {
          if (!d.open) setSelected(undefined);
        }}
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
            Financial work details
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          {selected && (
            <>
              <h2>{selected.name}</h2>
              <dl>
                {Object.entries({
                  Owner: selected.owner,
                  Status: selected.status,
                  Period: selected.period,
                  Due: selected.due,
                }).map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <p>{selected.handoff}</p>
              <p>{systemLink(selected.system)}</p>
              <a href={`${base}/${selected.area}`}>Related documents →</a>
            </>
          )}
        </DrawerBody>
      </Drawer>
    </div>
  );
}
