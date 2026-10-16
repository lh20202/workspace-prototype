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
import type { OperationalFile } from "../logistics/data";
import DocumentIcon from "../components/DocumentIcon";
import {
  title,
  description,
  areas,
  systems,
  items,
  files,
  fileContext,
  protectedSubjects,
  cycles,
  handoffs,
  views,
  selectItems,
  checklist,
  closeStages,
  scenarios,
  variance,
  lifecycle,
  calendar,
  type FinancialItem,
} from "./data";
import "../services/styles.css";
import "./styles.css";
const base = "/financial-operations";
export default function FinanceApp() {
  const parts = location.pathname.split("/").filter(Boolean),
    page = parts[1] || "home",
    subject = parts[2];
  const area = areas.find((a) => a.id === page),
    system =
      page === "systems" ? systems.find((s) => s.id === subject) : undefined;
  const protectedName = protectedSubjects[page]?.find(
    (s) => s[0] === subject,
  )?.[1];
  const unknown = !!subject && !protectedName && !system;
  const [records, setRecords] = useState(items),
    [view, setView] = useState("Current Cycle"),
    [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FinancialItem>(),
    [document, setDocument] = useState<OperationalFile>(),
    [notice, setNotice] = useState("");
  const [checks, setChecks] = useState<string[]>([]),
    [explanation, setExplanation] = useState(""),
    [savedExplanation, setSavedExplanation] = useState("");
  const [baseline, setBaseline] = useState(false);
  const rowLink = (id: string) => {
    const x = records.find((r) => r.id === id)!;
    return (
      <button className="finance-text-link" onClick={() => setSelected(x)}>
        {x.name}
      </button>
    );
  };
  const systemLink = (id: string, ref?: string) => {
    const s = systems.find((s) => s.id === id)!;
    return (
      <a href={`${base}/systems/${id}`}>
        Open in {s.name}
        {ref ? ` · ${ref}` : ""} ↗
      </a>
    );
  };
  function fileList(visible: OperationalFile[]) {
    return (
      <div className="finance-file-list">
        {visible.map((f) => (
          <button key={f.id} onClick={() => setDocument(f)}>
            <DocumentIcon name={f.name} />
            <span>
              {f.name}
              <small>
                {f.owner} · {f.modified} · {f.recordState}
              </small>
            </span>
          </button>
        ))}
      </div>
    );
  }
  const filtered = selectItems(records, view).filter(
    (x) =>
      (page === "home" || x.area === page) &&
      `${x.name} ${x.owner} ${x.status} ${x.reference}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  function register() {
    const income = page === "income",
      recon = page === "reconciliation",
      planning = page === "planning";
    return (
      <>
        <div className="finance-list-toolbar">
          <select
            aria-label="Saved view"
            value={view}
            onChange={(e) => setView(e.target.value)}
          >
            {views.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <input
            aria-label="Filter financial work"
            placeholder="Filter this view"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span>{filtered.length} items</span>
        </div>
        <div className="finance-table-scroll">
          <table>
            <thead>
              <tr>
                {[
                  income
                    ? "Item"
                    : recon
                      ? "Reconciliation"
                      : planning
                        ? "Planning item"
                        : "Work item",
                  "Owner",
                  recon
                    ? "Source → target"
                    : income
                      ? "Income source / method"
                      : planning
                        ? "Cycle / contributors"
                        : "Source",
                  "Stage / status",
                  ...(recon
                    ? ["Variance / open items", "Reviewer"]
                    : planning
                      ? ["Scenario / approved baseline", "Review date"]
                      : ["Next action / finance handoff"]),
                  "System reference",
                  "Due",
                  "Sensitivity",
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((x) => (
                <tr key={x.id}>
                  <td>
                    {rowLink(x.id)}
                    <small>
                      {x.id} · {x.period}
                    </small>
                  </td>
                  <td>{x.owner}</td>
                  <td>
                    {income ? (
                      <>
                        {x.source}
                        <small>{x.method}</small>
                      </>
                    ) : recon ? (
                      `${x.source} → ${x.target}`
                    ) : planning ? (
                      <>
                        {x.source}
                        <small>{x.contributors}</small>
                      </>
                    ) : (
                      x.source
                    )}
                  </td>
                  <td>
                    <span className="finance-status">{x.status}</span>
                  </td>
                  {recon ? (
                    <>
                      <td>
                        {x.openItems ? "Review required" : "No open difference"}
                        <small>{x.openItems} open items</small>
                      </td>
                      <td>{x.reviewer}</td>
                    </>
                  ) : planning ? (
                    <>
                      <td>
                        {x.scenario}
                        <small>
                          {baseline && x.id === "PLAN-01"
                            ? "2027 approved baseline · AP-271"
                            : x.baseline}
                        </small>
                      </td>
                      <td>2026-10-30</td>
                    </>
                  ) : (
                    <td>{x.handoff}</td>
                  )}
                  <td>{systemLink(x.system, x.reference)}</td>
                  <td>{x.due}</td>
                  <td>{x.sensitivity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <p>No matching shared work in this view.</p>}
        </div>
      </>
    );
  }
  const scope: Record<string, string> = {
    income:
      "Incoming payments · Matching · Corrections · Receipts · Refunds · Returns · Recurring payments · Data quality · System change requests · Operational handovers",
    reconciliation:
      "Income, bank, provider and ledger reconciliation · Open items · Adjustments · Month-end and year-end dependencies",
    payments:
      "Invoices · Approvals · Supplier settlement · Expenses · Payroll handoff · Tax payments · Failed and returned payments · Corrections · Intercompany obligations",
    planning:
      "Annual budgets · Rolling forecasts · Multi-year outlook · Scenarios · Cost, income, resource and investment analysis · Management reporting · Approved baselines",
    accounting:
      "General ledger · Journal review · Monthly and annual close · Financial statements · Tax and audit coordination · Statutory reporting · Corrections · Formal records",
    treasury:
      "Cash forecast · Banking arrangements · Account administration · Signatories · Payment capacity · Inter-entity funding · Transfers · Currency exposure · Banking risk",
  };
  return (
    <div className="app-shell services-app finance-app">
      <a className="skip-link" href="#finance-main">
        Skip to financial workspace
      </a>
      <WorkspaceHeader
        title={title}
        searchFiles={files}
        memberCount={28}
        onOpen={setDocument}
        onTeams={() => location.assign("/teams?staff=sam")}
        onMessage={setNotice}
        helpText="Shared financial coordination and source-system links. Sensitive subjects require specific access."
      />
      <div className="workspace-body finance-layout">
        <aside className="sidebar services-sidebar">
          <a href={base} aria-current={page === "home" ? "page" : undefined}>
            Home
          </a>
          {areas.map((a) => (
            <a
              key={a.id}
              href={`${base}/${a.id}`}
              aria-current={page === a.id ? "page" : undefined}
            >
              {a.name}
            </a>
          ))}
        </aside>
        <main id="finance-main" className="services-main finance-main">
          <div className="finance-breadcrumb">
            <a href={base}>Workspace</a> /{" "}
            {area?.name || system?.name || "Home"}
            {protectedName && " / Access required"}
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
              <h1>{protectedName || "This location is unavailable"}</h1>
              <p>
                This subject needs specific authorisation. Ordinary workspace
                membership does not grant access.
              </p>
              <p>
                Contact fictional access coordinator Robin Wells to discuss your
                work. If urgent, submit an access request to IT.
              </p>
              <a
                href={`/service-desk/access-request?${new URLSearchParams({ workspace: title, area: area?.name || "Financial operations", location: `${title} / ${area?.name} / ${protectedName || "Unavailable location"}` })}`}
              >
                Submit an access request to IT →
              </a>
              <p className="finance-muted">
                No underlying documents, transactions or personal details are
                included in this prototype.
              </p>
              <a href={`${base}/${page}`}>Return to {area?.name}</a>
            </section>
          ) : system ? (
            <section>
              <h1>{system.name}</h1>
              <p>{system.purpose}</p>
              <div className="finance-system-preview">
                <strong>{system.name}</strong>
                <p>
                  External system preview · Fictional reference {system.ref}
                </p>
                <p>
                  This is where the authoritative specialist record is
                  maintained. SharePoint connects working notes, reviews and
                  handoffs.
                </p>
                <p>
                  No transaction is executed and no external login is requested
                  in this demonstration.
                </p>
              </div>
              <a href={base}>Back to workspace</a>
            </section>
          ) : (
            <>
              <h1>
                {page === "home" ? title : area?.name || "Financial work"}
              </h1>
              <p className="finance-intro">
                {page === "home" ? description : scope[page]}
              </p>
              {page === "home" ? (
                <>
                  <div className="finance-home-grid">
                    <section>
                      <h2>Current financial cycle</h2>
                      {cycles.map((id) => {
                        const x = records.find((x) => x.id === id)!;
                        return (
                          <a
                            className="finance-cycle"
                            key={id}
                            href={`${base}/${x.area}`}
                          >
                            <strong>
                              {x.name === "Card processor → ERP"
                                ? "October income reconciliation"
                                : x.name}
                            </strong>
                            <span>{x.status}</span>
                          </a>
                        );
                      })}
                    </section>
                    <section>
                      <h2>Handoffs & exceptions</h2>
                      {handoffs.map((id) => {
                        const x = records.find((x) => x.id === id)!;
                        return (
                          <div className="finance-handoff" key={id}>
                            {rowLink(id)}
                            <small>{x.handoff}</small>
                            <span>{x.status}</span>
                          </div>
                        );
                      })}
                    </section>
                  </div>
                  <div className="finance-home-grid">
                    <section>
                      <h2>Upcoming deadlines</h2>
                      {calendar.slice(0, 4).map((e) => (
                        <p key={e.day}>
                          <strong>Oct {e.day}</strong> · {rowLink(e.item)}
                        </p>
                      ))}
                      <a href={`${base}/calendar`}>Financial calendar →</a>
                    </section>
                    <section>
                      <h2>Financial systems</h2>
                      <div className="finance-system-links">
                        {systems
                          .filter((s) => s.id !== "stripe")
                          .map((s) => (
                            <a key={s.id} href={`${base}/systems/${s.id}`}>
                              <strong>{s.name}</strong>
                              <small>{s.purpose}</small>
                            </a>
                          ))}
                      </div>
                    </section>
                  </div>
                  <section>
                    <h2>Current analysis</h2>
                    <p>
                      Q4 forecast contributions and operational variance
                      explanations are awaiting review.
                    </p>
                    <a href={`${base}/planning`}>
                      Contribute to planning & analysis →
                    </a>
                  </section>
                  <section>
                    <h2>Recent working files</h2>
                    {fileList(files.slice(0, 5))}
                  </section>
                  <section>
                    <details>
                      <summary>Browse shared work register</summary>
                      {register()}
                    </details>
                  </section>
                </>
              ) : page === "calendar" ? (
                <section>
                  <div className="finance-calendar-title">
                    <h2>October 2026</h2>
                    <span>Month · Shared financial milestones</span>
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
              ) : (
                <>
                  {page !== "treasury" && (
                    <section>
                      <h2>
                        {page === "income"
                          ? "Income Operations"
                          : page === "reconciliation"
                            ? "Reconciliation & Close Register"
                            : page === "planning"
                              ? "Financial planning cycle"
                              : "Current work"}
                      </h2>
                      {register()}
                    </section>
                  )}
                  {page === "income" && (
                    <section>
                      <h2>One income-to-finance workflow</h2>
                      <p>
                        Payment received → validated → corrected → classified →
                        matched → reconciled → accounting actual → reporting,
                        planning and liquidity.
                      </p>
                      <p>
                        Use the linked item for coordination. Customer records
                        remain in Salesforce, payment events in Stripe and
                        accounting actuals in NetSuite.
                      </p>
                      {rowLink("INC-01")} · {systemLink("stripe")}
                    </section>
                  )}
                  {page === "reconciliation" && (
                    <section>
                      <h2>Month-end close checklist</h2>
                      <p>
                        Coordination summary · Authoritative close approvals
                        remain in BlackLine.
                      </p>
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
                      <small>
                        {checks.length} / {checklist.length} dependencies
                        confirmed · Stages: {closeStages.join(" → ")}
                      </small>
                    </section>
                  )}
                  {page === "payments" && (
                    <section>
                      <h2>Approved source → financial obligation</h2>
                      <p>
                        Purchasing owns supplier selection, orders and
                        contracts. Payments validates the obligation, routes
                        approval, settles in NetSuite and confirms
                        reconciliation.
                      </p>
                      <a href="/services/procurement">
                        Open Organisation Services · Purchasing & Suppliers →
                      </a>
                      <p>
                        Use the original purchasing evidence; files are not
                        copied into this workspace.
                      </p>
                      {rowLink("PAY-02")}
                    </section>
                  )}
                  {page === "planning" && (
                    <>
                      <section>
                        <h2>Variance explanations</h2>
                        <p>
                          Illustrative amounts in thousands of fictional
                          currency units. Maya Chen can contribute to her
                          assigned income line only.
                        </p>
                        <div className="finance-table-scroll">
                          <table>
                            <thead>
                              <tr>
                                {[
                                  "Area",
                                  "Budget",
                                  "Actual",
                                  "Variance",
                                  "Variance %",
                                  "Explanation status",
                                  "Owner",
                                  "Action",
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
                                  <td>
                                    {(
                                      ((v.actual - v.budget) / v.budget) *
                                      100
                                    ).toFixed(1)}
                                    %
                                  </td>
                                  <td>
                                    {v.owner === "Maya Chen" && savedExplanation
                                      ? "Provided"
                                      : "Requested"}
                                  </td>
                                  <td>{v.owner}</td>
                                  <td>
                                    {v.owner === "Maya Chen"
                                      ? "Your contribution"
                                      : "Owner response pending"}
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
                          placeholder="Explain the aggregate variance; do not enter customer details."
                        />
                        <Button
                          disabled={!explanation.trim()}
                          onClick={() => {
                            setSavedExplanation(explanation.trim());
                            setNotice(
                              "Your assigned income explanation was saved locally for review.",
                            );
                          }}
                        >
                          Save explanation
                        </Button>
                        {savedExplanation && (
                          <p role="status">Maya Chen: {savedExplanation}</p>
                        )}
                      </section>
                      <section>
                        <h2>Scenarios & approved baselines</h2>
                        <p>{scenarios.join(" · ")}</p>
                        <p>
                          Pre-decision models require subject-specific access in
                          Adaptive Planning. This shared view contains
                          contribution milestones and approved baseline
                          references only.
                        </p>
                        <p>
                          {baseline
                            ? "2027 approved baseline available · AP-271. The underlying draft scenarios remain protected."
                            : "Current approved reference: 2026 baseline · AP-270. 2027 is awaiting owner approval."}
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
                                      baseline:
                                        "2027 approved baseline · AP-271",
                                    }
                                  : x,
                              ),
                            );
                            setNotice(
                              "Simulated budget-owner approval: approved baseline reference released. No financial model copied.",
                            );
                          }}
                          disabled={baseline}
                        >
                          Simulate budget-owner approval
                        </Button>{" "}
                        {systemLink("adaptive")}
                      </section>
                    </>
                  )}
                  {page === "accounting" && (
                    <section>
                      <h2>2026 Annual Financial Statements</h2>
                      <p>
                        Working papers → Draft statements → Audit questions →
                        Adjustments → Approval → Final statements
                      </p>
                      <span className="finance-status">
                        Working papers · October 2026
                      </span>
                      <p>
                        Shared schedules and coordination remain accessible.
                        Pre-issue statements, tax papers and sensitive
                        adjustments have separate subject access. Final approved
                        financial statements are formal records in NetSuite.
                      </p>
                      {systemLink("netsuite")}
                    </section>
                  )}
                  {page === "treasury" && (
                    <section>
                      <h2>Shared treasury coordination</h2>
                      {records
                        .filter((x) => x.area === "treasury")
                        .map((x) => (
                          <div className="finance-handoff" key={x.id}>
                            {rowLink(x.id)}
                            <small>{x.handoff}</small>
                            <span>{x.status}</span>
                          </div>
                        ))}
                      <p>
                        Contribute forecast timing, confirm accounting handoffs
                        and review operating methods. Banking instructions,
                        signatories, mandates and authorisations require
                        separate access.
                      </p>
                      {systemLink("kyriba")}
                    </section>
                  )}
                  <section>
                    <h2>Working files</h2>
                    {fileList(files.filter((f) => f.folder === page))}
                  </section>
                  {protectedSubjects[page] && (
                    <section>
                      <h2>Subjects requiring specific access</h2>
                      <p>
                        Access follows the work you need to do, rather than
                        organisational membership.
                      </p>
                      <div className="finance-protected-links">
                        {protectedSubjects[page].map(([id, name]) => (
                          <a key={id} href={`${base}/${page}/${id}`}>
                            <LockClosed20Regular />
                            {name}
                          </a>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
              <p className="finance-muted">
                Fictional coordination example. Changes are local to this
                browser session and reset on reload. Specialist platforms retain
                authoritative records.
              </p>
            </>
          )}
        </main>
      </div>
      <Drawer
        open={!!selected || !!document}
        position="end"
        onOpenChange={(_, d) => {
          if (!d.open) {
            setSelected(undefined);
            setDocument(undefined);
          }
        }}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                icon={<Dismiss20Regular />}
                aria-label="Close details"
                onClick={() => {
                  setSelected(undefined);
                  setDocument(undefined);
                }}
              />
            }
          >
            {selected ? "Financial work details" : "Working file"}
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          {selected ? (
            <>
              <h2>{selected.name}</h2>
              <p>
                {selected.id} · {selected.status}
              </p>
              <dl>
                {Object.entries({
                  Owner: selected.owner,
                  Period: selected.period,
                  "Next action / handoff": selected.handoff,
                  Due: selected.due,
                  Sensitivity: selected.sensitivity,
                  "Record state": selected.recordState,
                }).map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <h3>Connected lifecycle</h3>
              <ol>
                {(
                  lifecycle[selected.id] || [
                    selected.source,
                    selected.handoff,
                    "Review in the authoritative system",
                  ]
                ).map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              {systemLink(selected.system, selected.reference)}
              <p>
                <a href={`${base}/${selected.area}`}>
                  Open {areas.find((a) => a.id === selected.area)?.name}
                </a>
              </p>
              {selected.id === "PAY-01" && (
                <a href="/services/procurement">
                  Original purchasing & supplier evidence →
                </a>
              )}
            </>
          ) : (
            document && (
              <>
                <h2>{document.name}</h2>
                <p>
                  {document.id} · {document.owner}
                </p>
                <p>
                  {fileContext[document.id] ||
                    "Shared coordination and review evidence. Detailed transactions and sensitive case materials remain in their source systems or protected subjects."}
                </p>
                <p>
                  {document.recordState} · {document.sensitivity}
                </p>
                <a href={`${base}/${document.folder}`}>
                  Open SharePoint source area →
                </a>
              </>
            )
          )}
        </DrawerBody>
      </Drawer>
    </div>
  );
}
