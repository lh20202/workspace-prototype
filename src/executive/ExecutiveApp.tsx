import { useState } from "react";
import { LockClosed20Regular } from "@fluentui/react-icons";
import WorkspaceHeader from "../logistics/WorkspaceHeader";
import DocumentLibrary, {
  type LibraryDocument,
} from "../sharepoint/DocumentLibrary";
import {
  title,
  description,
  roles,
  navigation,
  canAccess,
  visibleFiles,
  visibleDecisions,
  decisionView,
  views,
  visibleInitiatives,
  initiativeStages,
  executiveCalendar,
  type ExecutiveRole,
} from "./data";
import "../services/styles.css";
import "../finance/styles.css";
import "./styles.css";
import { executiveDocument, executiveDefinition } from "./libraries";
export default function ExecutiveApp() {
  const page = location.pathname.split("/")[2] || "home";
  const requestedRole = new URLSearchParams(location.search).get("preview");
  const role: ExecutiveRole =
    roles.find((r) => r.id === requestedRole)?.id || "base";
  const person = roles.find((r) => r.id === role)!;
  const href = (area: string, as = role) =>
    `/executive${area === "home" ? "" : `/${area}`}?preview=${as}`;
  const sourceHref = (path: string) =>
    path.startsWith("/executive/") ? `${path}?preview=${role}` : path;
  const area = navigation.find((a) => a.id === page);
  const allowed = canAccess(page, role);
  const safeFiles = visibleFiles(role);
  const [notice, setNotice] = useState("");
  const [view, setView] = useState("Upcoming Decisions");
  const [decisionStates, setDecisionStates] = useState<Record<string, string>>(
    {},
  );
  const [initiativeStates, setInitiativeStates] = useState<
    Record<string, string>
  >({});
  const rows = visibleDecisions(role).map((d) => ({
    ...d,
    status: decisionStates[d.id] || d.status,
  }));
  const documents = (activity: string): LibraryDocument[] =>
    safeFiles
      .filter((f) =>
        activity === "coordination"
          ? f.audience === "base"
          : f.activity === activity,
      )
      .map(executiveDocument);
  function decisionTable(list = decisionView(rows, view)) {
    return (
      <div className="finance-table-scroll">
        <table>
          <thead>
            <tr>
              {["Decision", "Date", "Sponsor", "Status", "Follow-up due"].map(
                (h) => (
                  <th key={h}>{h}</th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {list.map((d) => (
              <tr key={d.id}>
                <td>
                  <a href={href(d.area)}>{d.name}</a>
                </td>
                <td>{d.date}</td>
                <td>{d.sponsor}</td>
                <td>
                  {role === "leadership" && d.area === "leadership" ? (
                    <select
                      aria-label={`Decision status ${d.id}`}
                      value={d.status}
                      onChange={(e) =>
                        setDecisionStates({
                          ...decisionStates,
                          [d.id]: e.target.value,
                        })
                      }
                    >
                      {[
                        "For decision",
                        "Deferred",
                        "Approved",
                        "Approved with conditions",
                        "Rejected",
                        "Completed",
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    d.status
                  )}
                </td>
                <td>
                  {d.followup}
                  <a href={sourceHref(d.source)}>Supporting work ↗</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p>No permitted items in this view.</p>}
      </div>
    );
  }
  const portal = (
    <a href="/governance">
      <LockClosed20Regular />
      Governance & Members Portal ↗
    </a>
  );
  const emergency = (
    <a href="/emergency-response">
      <LockClosed20Regular />
      Emergency Response · Strictly confidential ↗
    </a>
  );
  return (
    <div className="app-shell services-app executive-app">
      <a className="skip-link" href="#executive-main">
        Skip to executive workspace
      </a>
      <WorkspaceHeader
        title={title}
        searchFiles={safeFiles}
        userName={person.person}
        userRole={person.name}
        memberCount={14}
        onOpen={(f) => {
          const original = safeFiles.find((x) => x.id === f.id)!;
          location.assign(
            `${href(original.audience === "base" ? "coordination" : original.activity)}&file=${encodeURIComponent(f.id)}`,
          );
        }}
        onMessage={setNotice}
        helpText="Executive coordination. Leadership, liaison and initiative access are separate."
      />
      <div className="executive-preview">
        <span>Participation preview</span>
        <label>
          <select
            aria-label="Preview executive participation"
            value={role}
            onChange={(e) =>
              location.assign(href(page, e.target.value as ExecutiveRole))
            }
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="finance-layout">
        <aside className="sidebar services-sidebar">
          <nav aria-label="Executive workspace navigation">
            <a
              href={href("home")}
              aria-current={page === "home" ? "page" : undefined}
            >
              Home
            </a>
            {navigation
              .filter((a) => a.id !== "calendar")
              .map((a) => (
                <a
                  key={a.id}
                  href={href(a.id)}
                  aria-current={page === a.id ? "page" : undefined}
                >
                  {a.restricted && <LockClosed20Regular />}
                  {a.name}
                </a>
              ))}
          </nav>
        </aside>
        <main
          id="executive-main"
          className="services-main finance-main executive-main"
        >
          <div className="finance-breadcrumb">
            <a href={href("home")}>Workspace</a> / {area?.name || "Home"}
          </div>
          {notice && (
            <p role="status" className="finance-notice">
              {notice}
              <button onClick={() => setNotice("")}>Dismiss</button>
            </p>
          )}
          {!allowed ? (
            <section className="finance-protected">
              <LockClosed20Regular />
              <h1>Access denied</h1>
              <h2>{area?.name}</h2>
              <p>
                Specific participation is required. Use the participation
                preview to inspect an authorised fictional role.
              </p>
              <a
                href={`/service-desk/access-request?${new URLSearchParams({ workspace: title, area: area?.name || "Executive work", location: `${title} / ${area?.name}` })}`}
              >
                Request access →
              </a>
              {page === "oversight" && <p>{portal}</p>}
            </section>
          ) : page === "home" ? (
            <>
              <h1>{title}</h1>
              <p className="finance-intro">{description}</p>
              <DocumentLibrary
                title="Executive Coordination"
                definition={executiveDefinition("coordination")}
                files={documents("coordination")}
                embedded
              />
              <section>
                <h2>Upcoming decisions</h2>
                {decisionTable(
                  rows
                    .filter(
                      (d) =>
                        d.audience === "base" && !/Approved/.test(d.status),
                    )
                    .slice(0, 3),
                )}
              </section>
              <section>
                <h2>Governance handoffs</h2>
                <div className="functional-context-links">
                  {portal}
                  {emergency}
                </div>
              </section>
            </>
          ) : page === "coordination" ? (
            <>
              <DocumentLibrary
                title="Executive Coordination"
                definition={executiveDefinition("coordination")}
                files={documents("coordination")}
              />
              <p>
                <a href={href("decisions")}>Decisions & Actions</a> ·{" "}
                <a href={href("oversight")}>Oversight Committee Liaison</a>
              </p>
            </>
          ) : page === "leadership" ? (
            <>
              <DocumentLibrary
                title="Leadership Team"
                definition={executiveDefinition("leadership")}
                files={documents("leadership")}
              />
              <section>
                <details>
                  <summary>Leadership decisions</summary>
                  {decisionTable(rows.filter((d) => d.area === "leadership"))}
                </details>
              </section>
              <p>
                <a href={href("oversight")}>Oversight Committee Liaison →</a>
              </p>
            </>
          ) : page === "oversight" ? (
            <>
              <DocumentLibrary
                title="Oversight Committee Liaison"
                definition={executiveDefinition("oversight")}
                files={documents("oversight")}
              />
              <p>{portal}</p>
              <section>
                <details>
                  <summary>Submission follow-up</summary>
                  {decisionTable(rows.filter((d) => d.area === "oversight"))}
                </details>
              </section>
              <p>
                <a href="/governance/decisions?record=GOV-2026-04">
                  Formal resolution · GOV-2026-04 ↗
                </a>
              </p>
            </>
          ) : page === "initiatives" ? (
            <>
              <DocumentLibrary
                title="Strategic Initiatives"
                definition={executiveDefinition("initiatives")}
                files={documents("initiatives")}
              />
              <section>
                <details>
                  <summary>Initiative reviews</summary>
                  <div className="finance-table-scroll">
                    <table>
                      <thead>
                        <tr>
                          {[
                            "Initiative",
                            "Sponsor",
                            "Stage",
                            "Next review",
                            "Delivery",
                          ].map((h) => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {visibleInitiatives(role).map((i) => (
                          <tr key={i.id}>
                            <td>{i.name}</td>
                            <td>{i.sponsor}</td>
                            <td>
                              <select
                                aria-label={`Initiative stage ${i.id}`}
                                value={initiativeStates[i.id] || i.stage}
                                onChange={(e) =>
                                  setInitiativeStates({
                                    ...initiativeStates,
                                    [i.id]: e.target.value,
                                  })
                                }
                              >
                                {initiativeStages.map((s) => (
                                  <option key={s}>{s}</option>
                                ))}
                              </select>
                            </td>
                            <td>{i.review}</td>
                            <td>
                              <a href={i.delivery}>Delivery workspace ↗</a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </section>
            </>
          ) : page === "decisions" ? (
            <>
              <h1>Decisions & Actions</h1>
              <div className="finance-list-toolbar">
                <select
                  aria-label="Executive saved view"
                  value={view}
                  onChange={(e) => setView(e.target.value)}
                >
                  {views.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
              {decisionTable()}
            </>
          ) : page === "calendar" ? (
            <>
              <h1>Executive Calendar</h1>
              <h2>October 2026</h2>
              <div className="finance-calendar">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <strong key={d}>{d}</strong>
                ))}
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - 2;
                  return (
                    <div key={i}>
                      {day > 0 && day <= 31 && (
                        <>
                          {day}
                          {executiveCalendar
                            .filter((e) => e.day === day)
                            .map((e) => (
                              <a key={e.name} href={sourceHref(e.href)}>
                                {e.name}
                              </a>
                            ))}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <h1>This executive location is unavailable</h1>
          )}
        </main>
      </div>
    </div>
  );
}
