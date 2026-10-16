import { automationConcepts } from "./data";
import { useEffect, useState, type MouseEvent } from "react";
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
  Dismiss20Regular,
  Search20Regular,
  LockClosed20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  PeopleTeam24Regular,
} from "@fluentui/react-icons";
import WorkspaceHeader from "../logistics/WorkspaceHeader";
import DocumentIcon from "../components/DocumentIcon";
import {
  title,
  description,
  navigation,
  initiatives,
  files,
  filesById,
  decisions as initialDecisions,
  queryInitiatives,
  registerViews,
  libraryViews,
  queryFiles,
  segments,
  journey,
  measures,
  webEvidence,
  calendarItems,
  currentIds,
  latestAnalysis,
  fileHref,
  initiativeHref,
  stages,
  statuses,
  updateStage,
  pipelineStage,
  type Initiative,
  type WorkingFile,
} from "./data";
import "../services/styles.css";
import "./styles.css";
const base = "/audience-innovation";
const displayDate = (date: string) =>
  new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
export default function AudienceApp() {
  const [url, setUrl] = useState(
    location.pathname + location.search + location.hash,
  );
  const [items, setItems] = useState(initiatives);
  const [decisions, setDecisions] = useState(initialDecisions);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const [team, setTeam] = useState(false);
  const [journeyIndex, setJourneyIndex] = useState(0);
  const [month, setMonth] = useState(new Date(2026, 9, 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string[]>>({});
  const [comment, setComment] = useState("");
  useEffect(() => {
    const pop = () =>
      setUrl(location.pathname + location.search + location.hash);
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [message]);
  useEffect(() => {
    const id = location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, [url]);
  const parsed = new URL(url, location.origin);
  const params = parsed.searchParams;
  const parts = parsed.pathname.split("/").filter(Boolean);
  const page = parts[1] || "home";
  const protectedStudy =
    parsed.pathname ===
    `${base}/research/website-usability/participant-administration`;
  const system =
    page === "systems" &&
    ["website-analytics", "performance"].includes(parts[2]);
  const known =
    page === "home" || navigation.some((n) => n.id === page) || system;
  const nav = (href: string, replace = false) => {
    if (replace) history.replaceState({}, "", href);
    else history.pushState({}, "", href);
    setUrl(location.pathname + location.search + location.hash);
  };
  const intercept = (e: MouseEvent<HTMLDivElement>) => {
    const a = (e.target as HTMLElement).closest("a");
    const href = a?.getAttribute("href");
    if (
      href?.startsWith(base) &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.shiftKey &&
      !e.altKey
    ) {
      e.preventDefault();
      nav(href);
    }
  };
  const changeParams = (changes: Record<string, string>, replace = false) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    nav(parsed.pathname + (next.size ? "?" + next.toString() : ""), replace);
  };
  const selected = filesById.get(params.get("file") || "");
  const initiative = items.find((i) => i.id === params.get("initiative"));
  const openFile = (f: WorkingFile) =>
    changeParams({ file: f.id, initiative: "" });
  const openInitiative = (i: Initiative) =>
    changeParams({ initiative: i.id, file: "" });
  const search = params.get("search") || "";
  const stage = params.get("stage") || "";
  const status = params.get("status") || "";
  const registerView = registerViews.includes(params.get("registerView") || "")
    ? params.get("registerView")!
    : "All Initiatives";
  const libView = libraryViews.includes(params.get("view") || "")
    ? params.get("view")!
    : "All Working Files";
  const folder = params.get("folder") || "";
  const section = params.get("section") || "website";
  const list = queryInitiatives(items, registerView, search, stage, status);
  const library = queryFiles(page, items, libView, search, folder);
  const ownFiles = files.filter((f) => f.area === page);
  const folders = [...new Set(ownFiles.map((f) => f.folder))];
  const current = (id: string) => items.find((i) => i.id === id)!;
  const setStage = (id: string, value: string) => {
    setItems(items.map((i) => (i.id === id ? updateStage(i, value) : i)));
    setMessage("Initiative updated locally. Other views use the same record.");
  };
  const copy = async (href: string) => {
    try {
      await navigator.clipboard.writeText(location.origin + href);
      setMessage("Link copied.");
    } catch {
      setMessage("Use the address bar to copy this view’s link.");
    }
  };
  const fileLinks = (ids: string[]) => (
    <div className="rd-file-links">
      {ids.map((id) => {
        const f = filesById.get(id)!;
        return (
          <a href={fileHref(f)} key={id}>
            <DocumentIcon name={f.name} />
            <span>
              {f.name}
              <small>
                {f.campaign} · {f.review}
              </small>
            </span>
            <ArrowRight20Regular />
          </a>
        );
      })}
    </div>
  );
  const renderRegister = (experiments = false) => (
    <section className="service-section">
      <div className="service-section-heading">
        <h3>
          {experiments
            ? "Experiment Backlog"
            : "Research & Experiment Register"}
        </h3>
        {!experiments && (
          <a href={`${base}/research?registerView=Innovation+Pipeline`}>
            Innovation Pipeline <ArrowRight20Regular />
          </a>
        )}
      </div>
      <div className="service-library-toolbar">
        <label>
          Saved view
          <select
            aria-label="Register saved view"
            value={registerView}
            onChange={(e) => changeParams({ registerView: e.target.value })}
          >
            {registerViews.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Stage
          <select
            aria-label="Filter stage"
            value={stage}
            onChange={(e) => changeParams({ stage: e.target.value })}
          >
            <option value="">All stages</option>
            {stages.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select
            aria-label="Filter status"
            value={status}
            onChange={(e) => changeParams({ status: e.target.value })}
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <Input
          aria-label="Search register"
          placeholder="Search register"
          contentBefore={<Search20Regular />}
          value={search}
          onChange={(_, d) => changeParams({ search: d.value }, true)}
        />
      </div>
      <div className="table-scroll">
        <table className="service-table rd-register">
          <thead>
            <tr>
              {(experiments
                ? [
                    "Experiment / hypothesis",
                    "Audience / journey",
                    "Channel / variant",
                    "Primary metric",
                    "Owner",
                    "Start / end",
                    "Stage / status",
                    "Decision",
                  ]
                : [
                    "Initiative / research question",
                    "Type",
                    "Audience / journey",
                    "Channel",
                    "Owner",
                    "Stage / status",
                    "Primary measure",
                    "Decision date",
                  ]
              ).map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list
              .filter((i) => !experiments || i.experiment)
              .map((i) => (
                <tr key={i.id}>
                  <td>
                    <button onClick={() => openInitiative(i)}>
                      {experiments && i.id === "RD-103"
                        ? "Simplified sign-up flow"
                        : i.name}
                    </button>
                    <small>{i.question}</small>
                  </td>
                  {!experiments && <td>{i.type}</td>}
                  <td>
                    {i.segment}
                    <small>{i.journey}</small>
                  </td>
                  <td>
                    {i.channel}
                    {experiments && <small>{i.experiment!.variant}</small>}
                  </td>
                  {experiments && <td>{i.measure}</td>}
                  <td>{i.owner}</td>
                  {experiments && (
                    <td>
                      {displayDate(i.experiment!.start)}
                      <small>to {displayDate(i.experiment!.end)}</small>
                    </td>
                  )}
                  <td>
                    <span className="rd-status">
                      {registerView === "Innovation Pipeline"
                        ? pipelineStage(i)
                        : i.stage}
                    </span>
                    <small>{i.status}</small>
                  </td>
                  {experiments ? (
                    <td>
                      {decisions.find((d) => d.initiativeId === i.id)?.status ??
                        i.experiment!.decision}
                      <small>
                        <a href={`${base}/decisions?initiative=${i.id}`}>
                          Evidence & decisions
                        </a>
                      </small>
                    </td>
                  ) : (
                    <>
                      <td>{i.measure}</td>
                      <td>{displayDate(i.decisionDate)}</td>
                    </>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
        {!list.filter((i) => !experiments || i.experiment).length && (
          <p className="empty-state">No initiatives match these filters.</p>
        )}
      </div>
    </section>
  );
  const Library = () => (
    <section className="service-section">
      <h3>Working files</h3>
      <div className="service-library-toolbar">
        <label>
          Saved view
          <select
            aria-label="Library saved view"
            value={libView}
            onChange={(e) => changeParams({ view: e.target.value, folder: "" })}
          >
            {libraryViews.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <Input
          aria-label="Search working files"
          placeholder="Search working files"
          contentBefore={<Search20Regular />}
          value={search}
          onChange={(_, d) => changeParams({ search: d.value }, true)}
        />
        {folder && (
          <Button onClick={() => changeParams({ folder: "" })}>
            All folders
          </Button>
        )}
      </div>
      {!folder && !search && libView === "All Working Files" ? (
        <div className="service-folder-list">
          {folders.map((f) => (
            <a key={f} href={`${base}/${page}?folder=${encodeURIComponent(f)}`}>
              <Folder24Regular />
              <span>
                {f}
                <small>
                  {ownFiles.filter((d) => d.folder === f).length} working files
                </small>
              </span>
              <ArrowRight20Regular />
            </a>
          ))}
        </div>
      ) : (
        <>
          <p className="service-muted">
            {folder || libView} · {library.length} files
          </p>
          <div className="table-scroll">
            <table className="service-table">
              <thead>
                <tr>
                  {[
                    "Name",
                    "Initiative",
                    "Work type",
                    "Stage / review",
                    "Owner",
                    "Modified",
                  ].map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {library.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <button onClick={() => openFile(f)}>
                        <DocumentIcon name={f.name} />
                        {f.name}
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => openInitiative(current(f.initiativeId))}
                      >
                        {f.campaign}
                      </button>
                    </td>
                    <td>{f.workType}</td>
                    <td>
                      {current(f.initiativeId).stage}
                      <small>{f.review}</small>
                    </td>
                    <td>{f.owner}</td>
                    <td>16 Oct 2026</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!library.length && (
              <p className="empty-state">No working files match this view.</p>
            )}
          </div>
        </>
      )}
      {page === "research" &&
        (!folder || folder === "Website Usability Study") && (
          <a
            className="rd-protected-link"
            href={`${base}/research/website-usability/participant-administration`}
          >
            <LockClosed20Regular /> Website Usability Study — Participant
            administration <small>Narrower study access group</small>
          </a>
        )}
    </section>
  );
  const quickLinks = [
    { name: "Audience segmentation", href: `${base}/audiences#segmentation` },
    { name: "Journey maps", href: `${base}/audiences#journeys` },
    { name: "Experiment backlog", href: `${base}/experiments` },
    { name: "Website behaviour", href: `${base}/analytics?section=website` },
    { name: "Performance dashboard", href: `${base}/systems/performance` },
    { name: "Research calendar", href: `${base}/calendar` },
    {
      name: "Competitor scan",
      href: fileHref(filesById.get("competitor-scan")!),
    },
    {
      name: "Measurement framework",
      href: `${base}/analytics?section=framework`,
    },
  ];
  return (
    <div className="app-shell services-app audience-app" onClick={intercept}>
      <a className="skip-link" href="#audience-main">
        Skip to content
      </a>
      <WorkspaceHeader
        title={title}
        searchFiles={files}
        memberCount={18}
        helpText={description}
        onOpen={(f) => nav(fileHref(filesById.get(f.id)!))}
        onTeams={() => setTeam(true)}
        onMessage={setMessage}
      />
      <div className="workspace">
        <aside className="sidebar services-sidebar">
          <nav aria-label="Audience workspace navigation">
            <a href={base} aria-current={page === "home" ? "page" : undefined}>
              <Home24Regular />
              Home
            </a>
            <span className="service-nav-label">RESEARCH & INNOVATION</span>
            {navigation.map((n) => (
              <a
                key={n.id}
                href={`${base}/${n.id}`}
                aria-current={page === n.id ? "page" : undefined}
              >
                <Folder24Regular />
                {n.name}
              </a>
            ))}
          </nav>
        </aside>
        <main className="services-main" id="audience-main">
          <div className="breadcrumb">
            <a href={base}>Workspace</a>
            {page !== "home" && (
              <>
                {" "}
                /{" "}
                {navigation.find((n) => n.id === page)?.name ||
                  "Analytical systems"}
              </>
            )}
            {folder && <> / {folder}</>}
          </div>
          {!known || (parts.length > 2 && !protectedStudy && !system) ? (
            <>
              <h2>Page not found</h2>
              <a href={base}>Return to the workspace</a>
            </>
          ) : protectedStudy ? (
            <section className="service-restricted">
              <LockClosed20Regular />
              <span className="library-label">Protected study material</span>
              <h2>Website Usability Study — Participant administration</h2>
              <p>
                This study material has a narrower access group because
                participant administration requires restricted handling.
              </p>
              <p>
                Aggregate findings, discussion guides and working analysis
                remain available in Research & Discovery.
              </p>
              <p>
                Contact fictional study owner Alex Morgan if you need access.
              </p>
              <a
                href={
                  "/service-desk/access-request?" +
                  new URLSearchParams({
                    workspace: title,
                    area: "Research & Discovery",
                    location: `${title} / Website Usability Study / Participant administration`,
                  })
                }
              >
                Submit an access request to IT <ArrowRight20Regular />
              </a>
              <a href={`${base}/research?folder=Website+Usability+Study`}>
                Back to shared study files
              </a>
            </section>
          ) : system ? (
            <section className="rd-analytics-system">
              <div className="rd-system-heading">
                <span>
                  <ArrowUpRight20Regular /> LINKED ANALYTICAL SYSTEM · SYNTHETIC
                  DEMO
                </span>
                <h2>
                  {parts[2] === "performance"
                    ? "Performance dashboard"
                    : "Website Analytics"}
                </h2>
                <p>
                  Aggregate synthetic data · September 2026 · no tracking or
                  customer records
                </p>
              </div>
              <div className="rd-indicators">
                {[
                  {
                    label: "Journey starts",
                    value: "9,600",
                    change: "+6.2% vs August",
                  },
                  {
                    label: "Completion rate",
                    value: "16.2%",
                    change: "+1.1 percentage points",
                  },
                  {
                    label: "Mobile form drop-off",
                    value: "46%",
                    change: "−3 percentage points",
                  },
                ].map((m) => (
                  <section key={m.label}>
                    <span>{m.label}</span>
                    <strong>{m.value}</strong>
                    <small>{m.change}</small>
                  </section>
                ))}
              </div>
              <h3>Completion trend — fictional monthly cohorts</h3>
              <div className="rd-trend">
                {[
                  { month: "Jul", value: 14.4 },
                  { month: "Aug", value: 15.1 },
                  { month: "Sep", value: 16.2 },
                ].map((d) => (
                  <div key={d.month}>
                    <span>{d.month}</span>
                    <div style={{ width: `${d.value * 4}%` }} />
                    <strong>{d.value}%</strong>
                  </div>
                ))}
              </div>
              <p className="service-muted">
                Illustrative trends only; cohort differences and attribution
                limits prevent causal conclusions. Detailed tracking belongs in
                the analytical platform.
              </p>
              <h3>Interpretation & next steps</h3>
              {fileLinks(["website-funnel", "signup-results", "tracking-plan"])}
              <a href={`${base}/decisions`}>
                Review recommendations and decisions <ArrowRight20Regular />
              </a>
            </section>
          ) : (
            <>
              <div className="library-heading">
                <div>
                  <h2>
                    {page === "home"
                      ? title
                      : navigation.find((n) => n.id === page)!.name}
                  </h2>
                  <p>
                    {page === "home"
                      ? description
                      : page === "research"
                        ? "Develop questions, collect evidence and synthesise research together."
                        : page === "audiences"
                          ? "Working audience models and journeys, developed from aggregate synthetic evidence."
                          : page === "experiments"
                            ? "Hypothesis → test design → run → analyse → decide → feed learning into planning."
                            : page === "analytics"
                              ? "Working analysis, evaluation and interpretation linked to research questions."
                              : page === "decisions"
                                ? "Turn evidence into recommendations, decisions and future outreach planning."
                                : "Shared research sessions, experiment milestones and read-outs."}
                  </p>
                </div>
              </div>
              {page === "home" ? (
                <div className="services-home-layout">
                  <div>
                    <section className="service-section">
                      <div className="service-section-heading">
                        <h3>Current R&D</h3>
                        <a href={`${base}/research`}>
                          Research & Experiment Register <ArrowRight20Regular />
                        </a>
                      </div>
                      <div className="rd-current-list">
                        {currentIds.map((id) => {
                          const i = current(id);
                          return (
                            <button key={id} onClick={() => openInitiative(i)}>
                              <span>
                                <strong>{i.name}</strong>
                                <small>
                                  {i.type} · {i.owner}
                                </small>
                              </span>
                              <span className="rd-status">{i.stage}</span>
                              <ArrowRight20Regular />
                            </button>
                          );
                        })}
                      </div>
                    </section>
                    <section className="service-section">
                      <h3>Active experiments</h3>
                      <div className="rd-current-list">
                        {items
                          .filter((i) => i.experiment && i.stage === "Testing")
                          .map((i) => (
                            <button
                              key={i.id}
                              onClick={() => openInitiative(i)}
                            >
                              <span>
                                <strong>
                                  {i.id === "RD-103"
                                    ? "Simplified sign-up flow"
                                    : i.name}
                                </strong>
                                <small>{i.question}</small>
                              </span>
                              <span>{displayDate(i.experiment!.end)}</span>
                              <ArrowRight20Regular />
                            </button>
                          ))}
                      </div>
                      <a href={`${base}/experiments`}>
                        Open Experiment Backlog
                      </a>
                    </section>
                    <section className="service-section">
                      <h3>Quick links</h3>
                      <div className="rd-quick-links">
                        {quickLinks.map((q) => (
                          <a href={q.href} key={q.name}>
                            {q.name}
                            <ArrowRight20Regular />
                          </a>
                        ))}
                      </div>
                    </section>
                    <section className="service-section">
                      <h3>Latest analysis</h3>
                      {fileLinks(latestAnalysis)}
                    </section>
                  </div>
                  <aside className="services-home-aside">
                    <section>
                      <h3>Decisions & next steps</h3>
                      {decisions.map((d) => (
                        <a
                          href={`${base}/decisions?initiative=${d.initiativeId}`}
                          key={d.id}
                        >
                          <strong>{d.question}</strong>
                          <small>
                            {d.status} · {displayDate(d.date)}
                          </small>
                        </a>
                      ))}
                    </section>
                    <section>
                      <h3>Recent working files</h3>
                      {fileLinks([
                        "seg-model",
                        "signup-design",
                        "model-limitations",
                      ])}
                    </section>
                    <section>
                      <h3>Upcoming research</h3>
                      {calendarItems.slice(0, 3).map((c) => (
                        <a
                          href={`${base}/calendar?initiative=${c.initiativeId}`}
                          key={c.id}
                        >
                          {displayDate(c.date)} · {c.name}
                          <small>{c.owner}</small>
                        </a>
                      ))}
                    </section>
                    <section>
                      <h3>Working together</h3>
                      <p className="service-muted">
                        Maya Chen and Alex Morgan are reviewing the segmentation
                        model. Sam Patel has requested a limitations review
                        before the retention model proceeds.
                      </p>
                      <a
                        href={`${base}/research?registerView=Innovation+Pipeline`}
                      >
                        Explore Innovation Pipeline
                      </a>
                    </section>
                  </aside>
                </div>
              ) : page === "research" ? (
                <>
                  {renderRegister()}
                  <section className="service-section">
                    <h3>Research studies</h3>
                    <p className="service-muted">
                      Competitor examples BrightPath, CivicNorth, CommonGround
                      and OpenRiver are fictional comparators. Research covers
                      channel approaches, journeys, value propositions, digital
                      experience, sign-up friction, retention and emerging
                      practices.
                    </p>
                  </section>
                  {Library()}
                </>
              ) : page === "audiences" ? (
                <>
                  <section id="segmentation" className="service-section">
                    <h3>Customer Segmentation — working model</h3>
                    <p className="service-muted">
                      Synthetic aggregate size estimates; no identifiable
                      customer records. Confidence is under review.
                    </p>
                    <div className="table-scroll">
                      <table className="service-table">
                        <thead>
                          <tr>
                            {[
                              "Segment",
                              "Size estimate",
                              "Key behaviours",
                              "Primary motivation",
                              "Typical channel",
                              "Conversion likelihood",
                              "Retention risk",
                              "Research confidence",
                            ].map((h) => (
                              <th key={h}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {segments.map((s) => (
                            <tr key={s.name}>
                              <td>{s.name}</td>
                              <td>{s.size}</td>
                              <td>{s.behaviour}</td>
                              <td>{s.motivation}</td>
                              <td>{s.channel}</td>
                              <td>{s.conversion}</td>
                              <td>{s.risk}</td>
                              <td>{s.confidence}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <a href={fileHref(filesById.get("seg-model")!)}>
                      Open working segmentation model
                    </a>
                  </section>
                  <section id="journeys" className="service-section">
                    <h3>New Customer Journey</h3>
                    <div
                      className="rd-journey-tabs"
                      role="tablist"
                      aria-label="Journey stages"
                    >
                      {journey.map((j, index) => (
                        <button
                          role="tab"
                          aria-selected={journeyIndex === index}
                          aria-controls="journey-detail"
                          key={j.stage}
                          id={`journey-tab-${index}`}
                          onClick={() => setJourneyIndex(index)}
                        >
                          {j.stage}
                        </button>
                      ))}
                    </div>
                    <div
                      role="tabpanel"
                      id="journey-detail"
                      aria-labelledby={`journey-tab-${journeyIndex}`}
                      className="rd-journey-detail"
                    >
                      <h4>{journey[journeyIndex].stage}</h4>
                      <dl>
                        {Object.entries(journey[journeyIndex])
                          .filter(([k]) => !["stage", "file"].includes(k))
                          .map(([k, v]) => (
                            <div key={k}>
                              <dt>
                                {
                                  (
                                    {
                                      behaviour: "Typical behaviour",
                                      question: "Key question",
                                      friction: "Friction",
                                      touchpoints: "Channel touchpoints",
                                      evidence: "Evidence available",
                                      gap: "Research gap",
                                      test: "Opportunity to test",
                                    } as Record<string, string>
                                  )[k]
                                }
                              </dt>
                              <dd>{v}</dd>
                            </div>
                          ))}
                      </dl>
                      <a
                        href={fileHref(
                          filesById.get(journey[journeyIndex].file)!,
                        )}
                      >
                        Open source evidence <ArrowRight20Regular />
                      </a>
                    </div>
                  </section>
                  {Library()}
                </>
              ) : page === "experiments" ? (
                <>
                  {renderRegister(true)}
                  {Library()}
                </>
              ) : page === "automation" ? (
                <>
                  <h2>Marketing automation concepts</h2>
                  <p>
                    Segments, journeys, trigger strategy, scoring hypotheses,
                    retention concepts and measurement requirements.
                  </p>
                  {automationConcepts.map((c) => (
                    <section className="service-section" key={c.name}>
                      <h3>{c.name}</h3>
                      <p>{c.question}</p>
                      <p>
                        {c.owner} · {c.status}
                      </p>
                    </section>
                  ))}
                  <section className="service-section">
                    <h3>Concept to evaluation</h3>
                    <a href="/content-delivery/digital">
                      Content and message requirements →
                    </a>
                    <p>
                      <a href="/digital-tech/ai-automation">
                        Technical implementation handoff →
                      </a>
                    </p>
                    <a href="/audience-innovation/analytics">
                      Evaluate behaviour, conversion and retention →
                    </a>
                  </section>
                </>
              ) : page === "analytics" ? (
                <>
                  <div
                    className="rd-section-tabs"
                    role="group"
                    aria-label="Analytical focus"
                  >
                    {[
                      { id: "website", name: "Website Behaviour & UX" },
                      { id: "framework", name: "Measurement Framework" },
                      { id: "predictive", name: "Predictive Analytics" },
                    ].map((t) => (
                      <Button
                        key={t.id}
                        appearance={section === t.id ? "primary" : "secondary"}
                        onClick={() => changeParams({ section: t.id })}
                      >
                        {t.name}
                      </Button>
                    ))}
                  </div>
                  {section === "framework" ? (
                    <section className="service-section">
                      <h3>Outreach measurement framework</h3>
                      <div className="table-scroll">
                        <table className="service-table">
                          <thead>
                            <tr>
                              {[
                                "Measure",
                                "Definition",
                                "Research use",
                                "Guardrail / limitation",
                              ].map((h) => (
                                <th key={h}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {measures.map((m) => (
                              <tr key={m.name}>
                                <td>{m.name}</td>
                                <td>{m.definition}</td>
                                <td>{m.use}</td>
                                <td>{m.guardrail}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {fileLinks(["measurement-framework", "journey-kpi"])}
                    </section>
                  ) : section === "predictive" ? (
                    <section className="service-section">
                      <h3>Retention Propensity Pilot</h3>
                      <p>{current("RD-104").question}</p>
                      <p className="service-muted">
                        Exploratory model evaluation on synthetic aggregate
                        cohorts. Subgroup validation and bias review are
                        incomplete; this is not a production scoring service.
                      </p>
                      {fileLinks([
                        "model-brief",
                        "feature-assessment",
                        "validation-summary",
                        "model-limitations",
                        "model-recommendation",
                      ])}
                      <a href={`${base}/decisions?initiative=RD-104`}>
                        Review evidence and recommendation
                      </a>
                    </section>
                  ) : (
                    <section className="service-section">
                      <div className="service-section-heading">
                        <h3>Website Conversion Friction Study</h3>
                        <a href={`${base}/systems/website-analytics`}>
                          Website Analytics <ArrowUpRight20Regular />
                        </a>
                      </div>
                      <p>{current("RD-103").question}</p>
                      <div className="table-scroll">
                        <table className="service-table">
                          <thead>
                            <tr>
                              <th>Working evidence</th>
                              <th>Synthetic finding</th>
                              <th>Interpretation / research gap</th>
                            </tr>
                          </thead>
                          <tbody>
                            {webEvidence.map((e) => (
                              <tr key={e.name}>
                                <td>{e.name}</td>
                                <td>{e.finding}</td>
                                <td>{e.interpretation}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {fileLinks([
                        "website-funnel",
                        "usability-findings",
                        "signup-results",
                        "tracking-plan",
                      ])}
                      <a href={`${base}/systems/performance`}>
                        Open Performance dashboard <ArrowUpRight20Regular />
                      </a>
                    </section>
                  )}
                  {Library()}
                </>
              ) : page === "decisions" ? (
                <>
                  <section className="service-section">
                    <h3>Evidence & Decisions</h3>
                    <div className="table-scroll">
                      <table className="service-table">
                        <thead>
                          <tr>
                            {[
                              "Decision / question",
                              "Evidence source",
                              "Recommendation",
                              "Decision owner",
                              "Status",
                              "Decision date",
                              "Follow-up",
                            ].map((h) => (
                              <th key={h}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {decisions.map((d) => (
                            <tr key={d.id}>
                              <td>
                                <button
                                  onClick={() =>
                                    openInitiative(current(d.initiativeId))
                                  }
                                >
                                  {d.question}
                                </button>
                                <small>{d.id}</small>
                              </td>
                              <td>
                                <a href={fileHref(filesById.get(d.evidence)!)}>
                                  {filesById.get(d.evidence)!.name}
                                </a>
                              </td>
                              <td>{d.recommendation}</td>
                              <td>{d.owner}</td>
                              <td>
                                <select
                                  aria-label={`Decision status for ${d.question}`}
                                  value={d.status}
                                  onChange={(e) => {
                                    const next = e.target.value;
                                    setDecisions(
                                      decisions.map((x) =>
                                        x.id === d.id
                                          ? { ...x, status: next }
                                          : x,
                                      ),
                                    );
                                    if (next === "More evidence required")
                                      setItems(
                                        items.map((i) =>
                                          i.id === d.initiativeId
                                            ? updateStage(i, "Analysis")
                                            : i,
                                        ),
                                      );
                                    else if (next.startsWith("Approved"))
                                      setItems(
                                        items.map((i) =>
                                          i.id === d.initiativeId
                                            ? updateStage(i, "Completed")
                                            : i,
                                        ),
                                      );
                                    setMessage(
                                      "Decision updated locally; linked initiative stage reflects the next step.",
                                    );
                                  }}
                                >
                                  {[
                                    "Awaiting review",
                                    "More evidence required",
                                    "Approved for next stage",
                                    "Approved",
                                  ].map((s) => (
                                    <option key={s}>{s}</option>
                                  ))}
                                </select>
                              </td>
                              <td>{displayDate(d.date)}</td>
                              <td>{d.followup}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="service-muted">
                      Demonstration decisions reset on reload. Source evidence
                      is linked once and reused in recommendations and planning
                      inputs.
                    </p>
                  </section>
                  {Library()}
                </>
              ) : page === "calendar" ? (
                <ResearchCalendar
                  month={month}
                  setMonth={setMonth}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  onInitiative={(id) => openInitiative(current(id))}
                />
              ) : null}
            </>
          )}
        </main>
      </div>
      <Drawer
        open={!!initiative}
        position="end"
        size="medium"
        modalType="modal"
        onOpenChange={(_, d) => {
          if (!d.open) changeParams({ initiative: "" });
        }}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                icon={<Dismiss20Regular />}
                aria-label="Close initiative"
                onClick={() => changeParams({ initiative: "" })}
              />
            }
          >
            Initiative details
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          {initiative && (
            <>
              <span className="library-label">
                {initiative.id} · {initiative.type}
              </span>
              <h3>{initiative.name}</h3>
              <p>{initiative.question}</p>
              <dl className="service-properties">
                {[
                  ["Audience segment", initiative.segment],
                  ["Journey stage", initiative.journey],
                  ["Channel", initiative.channel],
                  ["Owner", initiative.owner],
                  ["Primary measure", initiative.measure],
                  ["Decision date", displayDate(initiative.decisionDate)],
                  ["Status", initiative.status],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <label className="rd-stage-edit">
                Stage
                <select
                  aria-label="Initiative stage"
                  value={initiative.stage}
                  onChange={(e) => setStage(initiative.id, e.target.value)}
                >
                  {stages.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              {initiative.experiment && (
                <p>
                  <strong>Variant:</strong> {initiative.experiment.variant}
                  <br />
                  <strong>Test window:</strong>{" "}
                  {displayDate(initiative.experiment.start)}–
                  {displayDate(initiative.experiment.end)}
                </p>
              )}
              <p className="service-muted">
                Working together · {initiative.owner} and{" "}
                {initiative.owner === "Maya Chen" ? "Alex Morgan" : "Maya Chen"}{" "}
                · edits reset on reload
              </p>
              <h4>Related working files</h4>
              {fileLinks(
                files
                  .filter((f) => f.initiativeId === initiative.id)
                  .map((f) => f.id),
              )}
              <h4>Evidence → decision → planning</h4>
              {decisions
                .filter((d) => d.initiativeId === initiative.id)
                .map((d) => (
                  <p key={d.id}>
                    <a href={`${base}/decisions`}>
                      {d.id} · {d.recommendation}
                    </a>
                    <br />
                    {d.status} · {d.followup}
                  </p>
                ))}
              {!decisions.some((d) => d.initiativeId === initiative.id) && (
                <p>
                  Evidence is still being developed. Review research gaps before
                  recommending a next step.
                </p>
              )}
              <h4>Review conversation</h4>
              <p className="rd-review-note">
                <strong>Maya Chen</strong> · 16 Oct
                <br />
                {initiative.id === "RD-104"
                  ? "Review subgroup limitations before proposing operational use."
                  : "Please check the evidence gaps and primary measure before the next review."}
              </p>
              {comments[initiative.id]?.map((text, index) => (
                <p className="rd-review-note" key={index}>
                  <strong>Maya Chen</strong> · Just now
                  <br />
                  {text}
                </p>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (comment.trim()) {
                    setComments({
                      ...comments,
                      [initiative.id]: [
                        ...(comments[initiative.id] || []),
                        comment.trim(),
                      ],
                    });
                    setComment("");
                  }
                }}
              >
                <Input
                  aria-label="Add review comment"
                  placeholder="Add a review comment"
                  value={comment}
                  onChange={(_, d) => setComment(d.value)}
                />
                <Button type="submit" disabled={!comment.trim()}>
                  Add comment
                </Button>
              </form>
            </>
          )}
        </DrawerBody>
      </Drawer>
      <Drawer
        open={!!selected}
        position="end"
        size="medium"
        modalType="modal"
        onOpenChange={(_, d) => {
          if (!d.open) changeParams({ file: "" });
        }}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                icon={<Dismiss20Regular />}
                aria-label="Close file details"
                onClick={() => changeParams({ file: "" })}
              />
            }
          >
            Working file details
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          {selected && (
            <>
              <DocumentIcon name={selected.name} />
              <h3>{selected.name}</h3>
              <p>
                {selected.folder} / {selected.campaign}
              </p>
              <span className="rd-status">{selected.review}</span>
              <p className="service-muted">
                Co-authors: {selected.coauthors.join(" · ")}
              </p>
              <Button appearance="primary" onClick={() => setPreview(true)}>
                Open
              </Button>{" "}
              <Button onClick={() => copy(fileHref(selected))}>
                Copy link
              </Button>
              <dl className="service-properties">
                {[
                  ["Work type", selected.workType],
                  ["Stage", current(selected.initiativeId).stage],
                  ["Audience", current(selected.initiativeId).segment],
                  ["Journey", current(selected.initiativeId).journey],
                  ["Owner", selected.owner],
                  [
                    "Decision date",
                    displayDate(current(selected.initiativeId).decisionDate),
                  ],
                  ["Sensitivity", selected.sensitivity],
                  ["Record state", selected.recordState],
                  ["Modified", "16 Oct 2026"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <a href={initiativeHref(current(selected.initiativeId))}>
                Open related research question <ArrowRight20Regular />
              </a>
              {decisions
                .filter((d) => d.evidence === selected.id)
                .map((d) => (
                  <p key={d.id}>
                    <a href={`${base}/decisions`}>
                      Used by {d.id}: {d.recommendation}
                    </a>
                  </p>
                ))}
            </>
          )}
        </DrawerBody>
      </Drawer>
      <Dialog open={preview} onOpenChange={(_, d) => setPreview(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogContent>
              Fictional working document. This simulated preview holds no Office
              file or identifiable research records. Review its properties,
              related initiative and source evidence in the workspace.
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreview(false)}>Close</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      <Dialog open={team} onOpenChange={(_, d) => setTeam(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>
              <PeopleTeam24Regular /> Connected team
            </DialogTitle>
            <DialogContent>
              <p>{title}</p>
              <p>
                Use enduring channels for discussion and shared working files.
              </p>
              {[
                { name: "General", area: "research" },
                { name: "Audience Research", area: "audiences" },
                { name: "Experimentation", area: "experiments" },
                { name: "Measurement & Analytics", area: "analytics" },
              ].map((c) => (
                <p key={c.name}>
                  <a href={`${base}/${c.area}`} onClick={() => setTeam(false)}>
                    {c.name} — open shared working files
                  </a>
                </p>
              ))}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setTeam(false)}>Close</Button>
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
function ResearchCalendar({
  month,
  setMonth,
  selectedDate,
  setSelectedDate,
  onInitiative,
}: {
  month: Date;
  setMonth: (d: Date) => void;
  selectedDate: string | null;
  setSelectedDate: (s: string | null) => void;
  onInitiative: (id: string) => void;
}) {
  const key = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (start.getDay() + 6) % 7;
  start.setDate(1 - offset);
  const weeks = Math.ceil(
    (offset +
      new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()) /
      7,
  );
  const days = Array.from(
    { length: weeks * 7 },
    (_, i) =>
      new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  );
  return (
    <>
      <div className="sp-calendar-toolbar">
        <Button
          aria-label="Previous research month"
          icon={<ChevronLeft20Regular />}
          onClick={() => {
            setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
            setSelectedDate(null);
          }}
        />
        <Button
          aria-label="Next research month"
          icon={<ChevronRight20Regular />}
          onClick={() => {
            setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));
            setSelectedDate(null);
          }}
        />
        <h3>
          {month.toLocaleDateString("en-GB", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <Button onClick={() => setMonth(new Date(2026, 9, 1))}>
          Example month
        </Button>
      </div>
      <div className="sp-calendar-scroll">
        <table className="sp-month-calendar" aria-label="Research calendar">
          <thead>
            <tr>
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((d) => (
                <th key={d}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: weeks }, (_, w) => (
              <tr key={w}>
                {days.slice(w * 7, w * 7 + 7).map((d) => {
                  const date = key(d);
                  return (
                    <td
                      key={date}
                      className={
                        d.getMonth() !== month.getMonth() ? "outside-month" : ""
                      }
                    >
                      <button
                        className="calendar-day-number"
                        onClick={() => setSelectedDate(date)}
                        aria-label={d.toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                        })}
                      >
                        {d.getDate()}
                      </button>
                      {calendarItems
                        .filter((c) => c.date === date)
                        .map((c) => (
                          <button
                            className="calendar-event"
                            key={c.id}
                            onClick={() => setSelectedDate(date)}
                          >
                            {c.time} {c.name}
                          </button>
                        ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedDate && (
        <section className="service-section">
          <h3>{displayDate(selectedDate)} · Research sessions</h3>
          {calendarItems
            .filter((c) => c.date === selectedDate)
            .map((c) => (
              <div className="rd-session" key={c.id}>
                <strong>
                  {c.time} · {c.name}
                </strong>
                <p>{c.owner}</p>
                <Button onClick={() => onInitiative(c.initiativeId)}>
                  Open related initiative <ArrowRight20Regular />
                </Button>
              </div>
            ))}
          {!calendarItems.some((c) => c.date === selectedDate) && (
            <p>No research sessions scheduled.</p>
          )}
        </section>
      )}
      <p className="service-muted">
        Fictional scheduling example · October 2026. Session links open the same
        initiative used in the register.
      </p>
    </>
  );
}
