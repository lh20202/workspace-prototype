import ExternalBrandMark from "../components/ExternalBrandMark";
import AccessLock from "../components/AccessLock";
import {
  externalEnvironmentForTool,
  externalPreviewHref,
} from "../environments/catalog";
import StaffLink from "../components/StaffLink";
import { withExplicitStaff } from "../utils/staffNavigation";
import { matchesDisplayText } from "../i18n/search";
import { useState } from "react";
import SimulationMessage from "../components/SimulationMessage";
import { canAccessArea } from "../access/policy";
import { protectedAreaDefinitions } from "../access/areaDefinitions";
import AccessBoundary from "../access/AccessBoundary";
import SensitivityBadge from "../sharepoint/SensitivityBadge";
import {
  protectedReviewSummaries,
  protectedReviewItemIds,
  strictlyConfidentialFinanceSubjects,
} from "./protectedReviews";
import PocAnnotation from "../components/PocAnnotation";
import {
  Button,
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
} from "@fluentui/react-components";
import { Dismiss20Regular } from "@fluentui/react-icons";
import WorkspaceHeader from "../logistics/WorkspaceHeader";
import { resolveStaffPerson } from "../intranet/catalog";
import NavigationIcon from "../components/NavigationIcon";
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
  const person = resolveStaffPerson(
    new URLSearchParams(location.search).get("staff"),
  );
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
  const restrictedArea = protectedAreaDefinitions.finance.includes(page)
    ? page
    : page === "reconciliation-issues"
      ? "reconciliation"
      : undefined;
  const restrictedLibraryArea = library?.areas.find(
    (areaId) =>
      protectedAreaDefinitions.finance.includes(areaId) &&
      !canAccessArea(person, "finance", areaId),
  );
  const boundaryAreaId = protectedName
    ? subject
    : restrictedArea || restrictedLibraryArea;
  const boundaryAreaName =
    protectedName ||
    (restrictedArea
      ? area?.name ||
        (page === "reconciliation-issues" ? "Reconciliation Issues" : undefined)
      : undefined) ||
    (restrictedLibraryArea ? library?.name : undefined);
  const unknown = parts.length > 3 || (!!subject && !protectedName && !system);
  const boundaryDenied =
    !!boundaryAreaId && !canAccessArea(person, "finance", boundaryAreaId);
  const protectedSensitivity = strictlyConfidentialFinanceSubjects.has(subject)
    ? "Strictly confidential"
    : "Confidential";
  const accessibleFiles = files.filter((file) =>
    canAccessArea(person, "finance", file.folder),
  );
  const accessibleLibraries = libraries.filter((item) =>
    item.areas.every((areaId) => canAccessArea(person, "finance", areaId)),
  );
  const [records, setRecords] = useState(items);
  const accessibleCalendar = calendar.filter((entry) => {
    const item = records.find((record) => record.id === entry.item);
    return !item || canAccessArea(person, "finance", item.area);
  });
  const protectedReviewItems = records.filter((item) =>
    protectedReviewItemIds[subject]?.includes(item.id),
  );
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
    return (
      <StaffLink
        href={externalPreviewHref(
          externalEnvironmentForTool(id)!.id,
          `${base}/${page === "home" ? "" : page}`,
        )}
      >
        <ExternalBrandMark id={externalEnvironmentForTool(id)!.id} size={24} />{" "}
        Open in {s.name} ↗
      </StaffLink>
    );
  };
  function issuesList() {
    const rows = records.filter(
      (x) =>
        (x.area === "income" || x.area === "reconciliation") &&
        (view !== "Open issues" || !/Complete|Approved/.test(x.status)) &&
        matchesDisplayText(`${x.name}\n${x.owner}`, query),
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
            : area?.name || library?.name || system?.name || "Home";
  const relatedToolByLibrary: Record<string, string> = {
    "income-documents": "blackline",
    "payment-documents": "netsuite",
    "treasury-documents": "kyriba",
    "accounting-documents": "netsuite",
  };
  return (
    <div className="app-shell services-app finance-app">
      <StaffLink className="skip-link" href="#finance-main">
        Skip to financial workspace
      </StaffLink>
      <WorkspaceHeader
        title={title}
        userName={person.name}
        userRole={person.role}
        searchFiles={accessibleFiles}
        memberCount={28}
        onOpen={(f) => {
          const l = libraries.find((x) => x.areas.includes(f.folder));
          if (l)
            location.assign(
              withExplicitStaff(
                `${base}/${l.id}?file=${encodeURIComponent(f.id)}`,
              ),
            );
        }}
        onMessage={setNotice}
        helpText="Financial working documents, close coordination and planning contributions."
      />
      <div className="workspace-body finance-layout">
        <aside className="sidebar services-sidebar">
          <nav aria-label="Financial workspace navigation">
            <StaffLink
              href={base}
              aria-current={page === "home" ? "page" : undefined}
            >
              <NavigationIcon kind="home" />
              Home
            </StaffLink>
            {libraries.map((l) => (
              <StaffLink
                key={l.id}
                href={`${base}/${l.id}`}
                aria-current={library?.id === l.id ? "page" : undefined}
              >
                <NavigationIcon kind="library" />
                {l.name}
              </StaffLink>
            ))}
            {library && relatedToolByLibrary[library.id] && (
              <details className="finance-navigation-tools" open>
                <summary>Related tools</summary>
                {systemLink(relatedToolByLibrary[library.id])}
              </details>
            )}
            {[
              ["close-checklist", "Close Checklist"],
              ["reconciliation-issues", "Reconciliation Issues"],
              ["calendar", "Financial Calendar"],
              ["restricted", "Restricted"],
            ].map(([id, name]) => (
              <StaffLink
                key={id}
                href={`${base}/${id}`}
                aria-current={page === id ? "page" : undefined}
              >
                <NavigationIcon
                  kind={
                    id === "restricted"
                      ? "restricted"
                      : id === "calendar"
                        ? "calendar"
                        : "list"
                  }
                />
                {name}
              </StaffLink>
            ))}
          </nav>
        </aside>
        <main
          id="finance-main"
          className={`services-main finance-main${page === "home" ? " finance-home" : ""}`}
        >
          <div className="finance-breadcrumb">
            <StaffLink href={base}>Workspace</StaffLink> /{" "}
            {protectedName || boundaryDenied
              ? !boundaryDenied
                ? protectedName
                : "Access required"
              : activeName}
          </div>
          {notice && (
            <div role="status" className="finance-notice">
              <SimulationMessage message={notice} />
              <button onClick={() => setNotice("")}>Dismiss</button>
            </div>
          )}
          {boundaryDenied || unknown ? (
            <AccessBoundary
              workspaceId="finance"
              resource={
                boundaryAreaId && !unknown
                  ? {
                      kind: "area",
                      workspaceId: "finance",
                      areaId: boundaryAreaId,
                    }
                  : undefined
              }
              area={boundaryAreaName || "Unavailable location"}
              location={[title, area?.name, protectedName]
                .filter(Boolean)
                .join(" / ")}
              personId={person.id}
              returnHref={withExplicitStaff(base)}
              sensitivity={
                protectedName
                  ? protectedSensitivity
                  : restrictedArea
                    ? "Confidential"
                    : undefined
              }
            />
          ) : protectedName ? (
            <section>
              <h1>{protectedName}</h1>
              <SensitivityBadge value={protectedSensitivity} />
              <p>{protectedReviewSummaries[subject]}</p>
              <div className="finance-table-scroll">
                <table>
                  <thead>
                    <tr>
                      {["Work item", "Owner", "Status", "Due"].map((label) => (
                        <th key={label}>{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {protectedReviewItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.owner}</td>
                        <td>{item.status}</td>
                        <td>{item.due}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                Individual payment details and live financial records are not
                held in this demonstration.
              </p>
              <DocumentLibrary
                title="Supporting working documents"
                headingLevel={2}
                files={library ? libraryFiles(library) : []}
                readOnly
              />
              <StaffLink href={`${base}/${library?.id || page}`}>
                Return to working documents
              </StaffLink>
            </section>
          ) : system ? (
            <section>
              <h1>{system.name}</h1>
              <p>{system.purpose}</p>
              <PocAnnotation title="System preview" variant="inline">
                Simulated external destination · {system.ref}
              </PocAnnotation>
              <StaffLink href={base}>Back to workspace</StaffLink>
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
                <StaffLink href={`${base}/close-checklist`}>
                  Continue the close checklist →
                </StaffLink>
                {canAccessArea(person, "finance", "planning") && (
                  <p>
                    <StaffLink href={`${base}/planning-documents?file=FIN-05`}>
                      2027 budget commentary →
                    </StaffLink>
                  </p>
                )}
              </section>
              <section>
                <h2>Upcoming deadlines</h2>
                {accessibleCalendar.slice(0, 3).map((e) => (
                  <p key={e.day}>
                    <span>Oct {e.day}</span> · {rowLink(e.item)}
                  </p>
                ))}
                <StaffLink href={`${base}/calendar`}>
                  Financial calendar →
                </StaffLink>
              </section>
              <DocumentLibrary
                title="Recently updated documents"
                files={accessibleLibraries.flatMap(libraryFiles)}
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
                    <StaffLink
                      key={`${id}-${key}`}
                      href={`${base}/${id}/${key}`}
                    >
                      <AccessLock size={20} labelled={false} />
                      {name}
                    </StaffLink>
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
                            {accessibleCalendar
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
                title={
                  area && library.areas.length > 1 ? area.name : library.name
                }
                definition={definitions[library.id]}
                files={libraryFiles(library)}
                initialFolder={area ? folderNames[area.id] : undefined}
              />
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
              <StaffLink href={`${base}/${selected.area}`}>
                Related documents →
              </StaffLink>
            </>
          )}
        </DrawerBody>
      </Drawer>
    </div>
  );
}
