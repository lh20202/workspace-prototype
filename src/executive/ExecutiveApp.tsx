import { useState } from "react";
import {
  Button,
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
} from "@fluentui/react-components";
import {
  LockClosed20Regular,
  ShieldLock24Regular,
  Dismiss20Regular,
  ArrowUpRight20Regular,
} from "@fluentui/react-icons";
import WorkspaceHeader from "../logistics/WorkspaceHeader";
import type { OperationalFile } from "../logistics/data";
import DocumentIcon from "../components/DocumentIcon";
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
  briefings,
  briefingStages,
  visibleInitiatives,
  initiativeStages,
  executiveCalendar,
  type ExecutiveRole,
} from "./data";
import "../services/styles.css";
import "../finance/styles.css";
import "./styles.css";
export default function ExecutiveApp() {
  const page = location.pathname.split("/")[2] || "home";
  const requestedRole = new URLSearchParams(location.search).get("preview");
  const role: ExecutiveRole =
      roles.find((r) => r.id === requestedRole)?.id || "base",
    person = roles.find((r) => r.id === role)!;
  const href = (area: string, as = role) =>
    `/executive${area === "home" ? "" : `/${area}`}?preview=${as}`;
  const sourceHref = (path: string) =>
    path.startsWith("/executive/") ? `${path}?preview=${role}` : path;
  const area = navigation.find((a) => a.id === page),
    allowed = canAccess(page, role),
    safeFiles = visibleFiles(role);
  const [file, setFile] = useState<OperationalFile>(),
    [notice, setNotice] = useState(""),
    [view, setView] = useState("Upcoming Decisions"),
    [briefingStates, setBriefingStates] = useState<Record<string, string>>({});
  const [decisionStates, setDecisionStates] = useState<Record<string, string>>(
      {},
    ),
    [initiativeStates, setInitiativeStates] = useState<Record<string, string>>(
      {},
    );
  const rows = visibleDecisions(role).map((d) => ({
    ...d,
    status: decisionStates[d.id] || d.status,
  }));
  const emergency = (
    <a className="executive-emergency" href="/emergency-response">
      <ShieldLock24Regular />
      <div>
        <small>STRICTLY CONFIDENTIAL</small>
        <h2>Emergency Response</h2>
        <p>
          Restricted real-time coordination for serious organisational
          incidents.
        </p>
        <span>Response capability available</span>
        <strong>Open Emergency Response →</strong>
      </div>
    </a>
  );
  const portal = (
    <a className="executive-portal-link" href="/governance">
      <ArrowUpRight20Regular />
      <div>
        <strong>Open Governance & Members Portal</strong>
        <span>
          Separate controlled environment · Independent governance access
        </span>
      </div>
    </a>
  );
  function fileList(list: OperationalFile[]) {
    return (
      <div className="finance-file-list">
        {list.map((f) => (
          <button key={f.id} onClick={() => setFile(f)}>
            <DocumentIcon name={f.name} />
            <span>
              {f.name}
              <small>
                {f.owner} · {f.recordState}
              </small>
            </span>
          </button>
        ))}
      </div>
    );
  }
  function decisionTable(list = decisionView(rows, view)) {
    return (
      <div className="finance-table-scroll">
        <table>
          <thead>
            <tr>
              {[
                "Decision",
                "Decision body",
                "Date",
                "Sponsor",
                "Status",
                "Supporting area",
                "Follow-up due",
              ].map((x) => (
                <th key={x}>{x}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((d) => (
              <tr key={d.id}>
                <td>
                  <a href={href(d.area)}>{d.name}</a>
                  <small>
                    {d.id} ·{" "}
                    {d.audience === "base"
                      ? "Shared coordination metadata"
                      : "Restricted decision"}
                  </small>
                </td>
                <td>{d.body}</td>
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
                  <a href={sourceHref(d.source)}>
                    {d.source.startsWith("/governance")
                      ? "Separate governance source"
                      : "Open source workspace"}{" "}
                    ↗
                  </a>
                </td>
                <td>{d.followup}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p>No permitted items in this view.</p>}
      </div>
    );
  }
  return (
    <div className="app-shell services-app executive-app">
      <WorkspaceHeader
        title={title}
        searchFiles={safeFiles}
        userName={person.person}
        userRole={person.name}
        memberCount={14}
        onOpen={setFile}
        onTeams={() => location.assign("/teams?staff=robin")}
        onMessage={setNotice}
        helpText="Executive coordination connects decisions to source workspaces. Leadership, liaison and initiative access are separate."
      />
      <div className="executive-preview">
        <span>ACCESS SIMULATION · {person.person}</span>
        <label>
          Preview participation
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
        <small>
          Each role grants only its specific working area. Governance and
          incident access remain separate.
        </small>
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
            {navigation.map((a) => (
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
        <main className="services-main finance-main executive-main">
          <div className="finance-breadcrumb">
            <a href={href("home")}>Executive workspace</a> /{" "}
            {area?.name || "Home"}
          </div>
          {notice && (
            <p role="status" className="finance-notice">
              {notice}
            </p>
          )}
          {!allowed ? (
            <>
              <section className="finance-protected">
                <LockClosed20Regular />
                <h1>{area?.name}</h1>
                <p>
                  This working area requires specific participation. Base
                  executive workspace membership does not grant access.
                </p>
                <p>
                  {page === "oversight"
                    ? "Executive-side preparation and follow-up only; formal committee records live in the separate governance portal."
                    : page === "initiatives"
                      ? "Initiative participants see only the initiative they work on. Other initiative and leadership papers remain outside their access."
                      : "Pre-reads, options and collective deliberation are limited to the authorised Leadership Team."}
                </p>
                <p>
                  Use the clearly labelled participation preview above to
                  inspect the relevant fictional authorised role.
                </p>
                <a
                  href={`/service-desk/access-request?${new URLSearchParams({ workspace: title, area: area?.name || "Executive work", location: `${title} / ${area?.name}` })}`}
                >
                  Request access to this working area →
                </a>
              </section>
              {page === "oversight" && portal}
            </>
          ) : (
            <>
              <h1>{page === "home" ? title : area?.name}</h1>
              {page === "home" ? (
                <>
                  <p className="finance-intro">{description}</p>
                  <div className="finance-home-grid">
                    <section>
                      <h2>Executive priorities</h2>
                      {[
                        {
                          name: "2027 operating priorities",
                          link: "/planning/strategy",
                        },
                        {
                          name: "Service transformation decision",
                          link: href("leadership"),
                        },
                        {
                          name: "Three-year investment outlook",
                          link: "/financial-operations/planning",
                        },
                        {
                          name: "Organisation structure review",
                          link: href("leadership"),
                        },
                        {
                          name: "Digital capability programme",
                          link: href("initiatives"),
                        },
                        {
                          name: "Quarterly organisational performance review",
                          link: "/planning/reporting",
                        },
                      ].map((x) => (
                        <a className="finance-cycle" key={x.name} href={x.link}>
                          {x.name}
                          <span>Open →</span>
                        </a>
                      ))}
                    </section>
                    <section>
                      {emergency}
                      <h2>Upcoming decisions</h2>
                      {rows
                        .filter(
                          (x) =>
                            x.audience === "base" && !/Approved/.test(x.status),
                        )
                        .slice(0, 4)
                        .map((d) => (
                          <a
                            className="finance-cycle"
                            key={d.id}
                            href={href(d.area)}
                          >
                            <div>
                              <strong>{d.name}</strong>
                              <small>
                                {d.body} · {d.date}
                              </small>
                            </div>
                            <span>{d.status}</span>
                          </a>
                        ))}
                    </section>
                  </div>
                  <div className="finance-home-grid">
                    <section>
                      <h2>Governance cycle</h2>
                      <p>
                        Executive submission preparation → committee
                        consideration → formal resolution → executive follow-up.
                      </p>
                      <a href={href("oversight")}>
                        Oversight Committee Liaison →
                      </a>
                      {portal}
                    </section>
                    <section>
                      <h2>Strategic Initiatives</h2>
                      <p>
                        Executive sponsorship, stage reviews and investment
                        decisions. Delivery continues in the source workspace.
                      </p>
                      <a href={href("initiatives")}>
                        Open controlled initiative oversight →
                      </a>
                      <p>
                        <a href="/projects/PRJ-2026-014">
                          PRJ-2026-014 · Customer Platform Renewal · Delivery source ↗
                        </a>
                      </p>
                    </section>
                  </div>

                  <section>
                    <h2>Recent approved / shared work</h2>
                    {fileList(
                      safeFiles
                        .filter((f) => f.audience === "base")
                        .slice(0, 4),
                    )}
                  </section>
                </>
              ) : page === "coordination" ? (
                <>
                  <p>
                    Meeting coordination, briefing inputs, approved actions,
                    organisational dependencies, correspondence and governance
                    submissions.
                  </p>
                  <section>
                    <h2>Executive Briefings</h2>
                    <div className="finance-table-scroll">
                      <table>
                        <thead>
                          <tr>
                            {[
                              "Briefing / purpose",
                              "Sponsor",
                              "Destination",
                              "Due",
                              "Stage",
                              "Decision required",
                              "Source",
                            ].map((x) => (
                              <th key={x}>{x}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {briefings.map((b) => (
                            <tr key={b.name}>
                              <td>
                                {b.name}
                                <small>{b.purpose} · Shared coordination</small>
                              </td>
                              <td>{b.sponsor}</td>
                              <td>{b.destination}</td>
                              <td>{b.due}</td>
                              <td>
                                <select
                                  aria-label={`Briefing stage ${b.name}`}
                                  value={briefingStates[b.name] || b.stage}
                                  onChange={(e) =>
                                    setBriefingStates({
                                      ...briefingStates,
                                      [b.name]: e.target.value,
                                    })
                                  }
                                >
                                  {briefingStages.map((s) => (
                                    <option key={s}>{s}</option>
                                  ))}
                                </select>
                              </td>
                              <td>{b.decision}</td>
                              <td>
                                <a href={sourceHref(b.source)}>
                                  Source workspace ↗
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                  <section>
                    <h2>Shared working files</h2>
                    {fileList(safeFiles.filter((f) => f.audience === "base"))}
                  </section>
                </>
              ) : page === "leadership" ? (
                <>
                  <p className="executive-restricted-chip">
                    <LockClosed20Regular />
                    Authorised Leadership Team participation preview
                  </p>
                  <section>
                    <h2>Leadership Team — 21 October</h2>
                    <small>
                      Weekly executive meeting series · Next meeting 28 October
                    </small>
                    <p>
                      Agenda · Pre-read pack · Decision papers · Decisions &
                      actions · Follow-up
                    </p>
                    {fileList(
                      safeFiles.filter((f) => f.activity === "leadership"),
                    )}
                  </section>
                  <section>
                    <h2>Leadership Decisions</h2>
                    {decisionTable(rows.filter((d) => d.area === "leadership"))}
                  </section>
                  <section>
                    <h2>Controlled decision handoffs</h2>
                    <p>
                      ED-105 is the minimal executive decision reference
                      returned to the separately controlled response
                      environment. No incident files or response details are
                      copied here.
                    </p>
                    <p>
                      Approved leadership outcome → liaison prepares submission
                      → formal governance record → authorised executive
                      follow-up.
                    </p>
                    <a href={href("oversight")}>
                      Oversight Committee Liaison · Separate permission required
                      →
                    </a>
                  </section>
                </>
              ) : page === "oversight" ? (
                <>
                  <p className="executive-restricted-chip">
                    <LockClosed20Regular />
                    Authorised executive-side governance liaison preview
                  </p>
                  <p>
                    Prepare submissions, CEO briefings, committee responses and
                    follow-up. Formal committee papers, minutes, member records
                    and resolutions belong in the separate governance
                    environment.
                  </p>
                  {portal}
                  <section>
                    <h2>Submission preparation & follow-up</h2>
                    {decisionTable(rows.filter((d) => d.area === "oversight"))}
                    {fileList(
                      safeFiles.filter((f) => f.activity === "oversight"),
                    )}
                  </section>
                  <section>
                    <h2>Formal resolution reference</h2>
                    <p>
                      Executive follow-up refers to the governance source. The
                      authoritative resolution is not copied here.
                    </p>
                    <a href="/governance/decisions?record=GOV-2026-04">
                      GOV-2026-04 · Open formal governance record in separate
                      portal ↗
                    </a>
                  </section>
                </>
              ) : page === "initiatives" ? (
                <>
                  <p className="executive-restricted-chip">
                    <LockClosed20Regular />
                    {role === "initiative"
                      ? "Digital Service Renewal participation only"
                      : "Authorised strategic review participant preview"}
                  </p>
                  <p>
                    Proposals, prioritisation, investment options, capacity,
                    strategic contribution, executive risk, continuation / pause
                    / stop decisions and benefits outlook. Delivery plans stay
                    in delivery workspaces.
                  </p>
                  <section>
                    <h2>Strategic Initiatives</h2>
                    <div className="finance-table-scroll">
                      <table>
                        <thead>
                          <tr>
                            {[
                              "Initiative / purpose",
                              "Sponsor",
                              "Stage",
                              "Investment level",
                              "Capacity impact",
                              "Strategic contribution",
                              "Status / decision required",
                              "Next review",
                              "Delivery workspace",
                            ].map((x) => (
                              <th key={x}>{x}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {visibleInitiatives(role).map((i) => (
                            <tr key={i.id}>
                              <td>
                                {i.name}
                                <small>
                                  {i.id} · {i.purpose} · Restricted
                                </small>
                              </td>
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
                              <td>{i.investment}</td>
                              <td>{i.capacity}</td>
                              <td>{i.contribution}</td>
                              <td>
                                {i.status}
                                <small>{i.decision}</small>
                              </td>
                              <td>{i.review}</td>
                              <td>
                                <a href={i.delivery}>Open delivery source ↗</a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                  <section>
                    <h2>Stage review handoff</h2>
                    <p>
                      Delivery business case / summary → executive stage review
                      → decision reference → delivery owner continues in its
                      working environment.
                    </p>
                    {fileList(
                      safeFiles.filter((f) => f.activity === "initiatives"),
                    )}
                    <a href="/content-delivery/digital">
                      Digital Service Renewal · Delivery working environment ↗
                    </a>
                  </section>
                </>
              ) : page === "decisions" ? (
                <>
                  <p>
                    Shared decision queue and approved actions. Pre-decision
                    papers are available only within the relevant controlled
                    working area.
                  </p>
                  <label>
                    Saved view
                    <select
                      aria-label="Executive saved view"
                      value={view}
                      onChange={(e) => setView(e.target.value)}
                    >
                      {views.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </label>
                  {decisionTable()}
                  <p>
                    Approved outcomes link to source plans and reports;
                    decisions do not duplicate authoritative organisational
                    planning libraries.
                  </p>
                </>
              ) : page === "calendar" ? (
                <>
                  <p>Shared executive milestones · October 2026</p>
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
                <p>This executive location is unavailable.</p>
              )}
            </>
          )}
        </main>
      </div>
      <Drawer
        open={!!file}
        onOpenChange={(_, d) => {
          if (!d.open) setFile(undefined);
        }}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                icon={<Dismiss20Regular />}
                aria-label="Close executive file"
                onClick={() => setFile(undefined)}
              />
            }
          >
            Executive working file
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          <h2>{file?.name}</h2>
          <p>
            {file?.id} · {file?.owner} · {file?.recordState}
          </p>
          <p>
            Synthetic working context only. Source planning, delivery and formal
            governance records remain in their own environments.
          </p>
        </DrawerBody>
      </Drawer>
    </div>
  );
}
