import StaffLink from "../components/StaffLink";
import { canAccessWorkspace, canAccessArea } from "../access/policy";
import { useState } from "react";
import AccessBoundary from "../access/AccessBoundary";
import { LockClosed20Regular } from "@fluentui/react-icons";
import WorkspaceHeader from "../logistics/WorkspaceHeader";
import NavigationIcon from "../components/NavigationIcon";
import DocumentLibrary, {
  type LibraryDocument,
} from "../sharepoint/DocumentLibrary";
import {
  title,
  description,
  navigation,
  files,
  decisions,
  initiatives,
  decisionView,
  views,
  initiativeStages,
  executiveCalendar,
} from "./data";
import "../services/styles.css";
import "../finance/styles.css";
import "./styles.css";
import { resolveStaffPerson } from "../intranet/catalog";
import { executiveDocument, executiveDefinition } from "./libraries";
export default function ExecutiveApp() {
  const page = location.pathname.split("/")[2] || "home";
  const staffPerson = resolveStaffPerson(
    new URLSearchParams(location.search).get("staff"),
  );
  const workspaceAllowed = canAccessWorkspace(staffPerson, "executive");
  const href = (area: string) =>
    `/executive${area === "home" ? "" : `/${area}`}?staff=${staffPerson.id}`;
  const sourceHref = (path: string) => {
    const target = new URL(path, location.href);
    target.searchParams.set("staff", staffPerson.id);
    return target.pathname + target.search;
  };
  const area = navigation.find((a) => a.id === page);
  const allowed = canAccessArea(staffPerson, "executive", page);
  const safeFiles = files.filter(
    (file) =>
      workspaceAllowed &&
      canAccessArea(staffPerson, "executive", file.activity),
  );
  const [notice, setNotice] = useState("");
  const [view, setView] = useState("Upcoming Decisions");
  const [decisionStates, setDecisionStates] = useState<Record<string, string>>(
    {},
  );
  const [initiativeStates, setInitiativeStates] = useState<
    Record<string, string>
  >({});
  const rows = decisions
    .filter((d) => canAccessArea(staffPerson, "executive", d.area))
    .map((d) => ({
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
                  <StaffLink href={href(d.area)}>{d.name}</StaffLink>
                </td>
                <td>{d.date}</td>
                <td>{d.sponsor}</td>
                <td>
                  {canAccessArea(staffPerson, "executive", "leadership") &&
                  d.area === "leadership" ? (
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
                  <StaffLink href={sourceHref(d.source)}>
                    Supporting work ↗
                  </StaffLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p>No permitted items in this view.</p>}
      </div>
    );
  }
  if (!workspaceAllowed)
    return (
      <div className="app-shell services-app executive-app">
        <WorkspaceHeader
          title={title}
          searchFiles={[]}
          userName={staffPerson.name}
          userRole={staffPerson.role}
          memberCount={14}
          onMessage={setNotice}
          onOpen={() => {}}
          helpText="Access is limited to authorised participants and remains separate for each protected area."
        />
        <main
          className="services-main finance-main executive-main"
          id="executive-main"
        >
          {notice && (
            <p role="status" className="finance-notice">
              {notice}
              <button onClick={() => setNotice("")}>Dismiss</button>
            </p>
          )}
          <AccessBoundary
            workspaceId="executive"
            area={title}
            resource={
              page === "home"
                ? { kind: "workspace", workspaceId: "executive" }
                : area
                  ? { kind: "area", workspaceId: "executive", areaId: page }
                  : undefined
            }
            personId={staffPerson.id}
            strict
            returnHref="/architecture"
            returnLabel="Back to all workspaces"
          />
        </main>
      </div>
    );
  const portal = (
    <StaffLink href="/governance/approved">
      <LockClosed20Regular />
      Governance & Members Portal ↗
    </StaffLink>
  );
  const emergency = (
    <StaffLink href="/emergency-response">
      <LockClosed20Regular />
      Emergency Response · Strictly confidential ↗
    </StaffLink>
  );
  return (
    <div className="app-shell services-app executive-app">
      <StaffLink className="skip-link" href="#executive-main">
        Skip to executive workspace
      </StaffLink>
      <WorkspaceHeader
        title={title}
        searchFiles={safeFiles}
        userName={staffPerson.name}
        userRole={staffPerson.role}
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
      <div className="finance-layout">
        <aside className="sidebar services-sidebar">
          <nav aria-label="Executive workspace navigation">
            <StaffLink
              href={href("home")}
              aria-current={page === "home" ? "page" : undefined}
            >
              <NavigationIcon kind="home" />
              Home
            </StaffLink>
            {navigation
              .filter((a) => a.id !== "calendar")
              .map((a) => (
                <StaffLink
                  key={a.id}
                  href={href(a.id)}
                  aria-current={page === a.id ? "page" : undefined}
                >
                  <NavigationIcon
                    kind={
                      a.restricted
                        ? "restricted"
                        : a.id === "decisions"
                          ? "list"
                          : "library"
                    }
                  />
                  {a.name}
                </StaffLink>
              ))}
          </nav>
        </aside>
        <main
          id="executive-main"
          className="services-main finance-main executive-main"
        >
          <div className="finance-breadcrumb">
            <StaffLink href={href("home")}>Workspace</StaffLink> /{" "}
            {area?.name || "Home"}
          </div>
          {notice && (
            <p role="status" className="finance-notice">
              {notice}
              <button onClick={() => setNotice("")}>Dismiss</button>
            </p>
          )}
          {!allowed ? (
            <AccessBoundary
              workspaceId="executive"
              area={area?.name || "Executive work"}
              personId={staffPerson.id}
              resource={{
                kind: "area",
                workspaceId: "executive",
                areaId: page,
              }}
              returnHref={href("home")}
              strict
            />
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
                <StaffLink href={href("decisions")}>
                  Decisions & Actions
                </StaffLink>{" "}
                ·{" "}
                <StaffLink href={href("oversight")}>
                  Oversight Committee Liaison
                </StaffLink>
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
                <StaffLink href={href("oversight")}>
                  Oversight Committee Liaison →
                </StaffLink>
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
                <StaffLink href="/governance/approved?record=GOV-2026-04">
                  Formal resolution · GOV-2026-04 ↗
                </StaffLink>
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
                        {initiatives
                          .filter((initiative) =>
                            canAccessArea(
                              staffPerson,
                              "executive",
                              initiative.id,
                            ),
                          )
                          .map((i) => (
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
                                <StaffLink href={i.delivery}>
                                  Delivery workspace ↗
                                </StaffLink>
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
                              <StaffLink key={e.name} href={sourceHref(e.href)}>
                                {e.name}
                              </StaffLink>
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
