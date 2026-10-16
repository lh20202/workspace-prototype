import { useEffect, useState, type MouseEvent } from "react";
import {
  Button,
  Input,
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
} from "@fluentui/react-components";
import {
  Home24Regular,
  Folder24Regular,
  List24Regular,
  Dismiss20Regular,
  Search20Regular,
  LockClosed20Regular,
  ArrowUpRight20Regular,
  ArrowRight20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
} from "@fluentui/react-icons";
import WorkspaceHeader from "../logistics/WorkspaceHeader";
import DocumentLibrary, {
  type LibraryDocument,
} from "../sharepoint/DocumentLibrary";
import {
  title,
  description,
  files,
  filesById,
  initiatives,
  decisions as initialDecisions,
  queryInitiatives,
  stages,
  updateStage,
  automationConcepts,
  calendarItems,
  journey,
  segments,
  type WorkingFile,
  type Initiative,
} from "./data";
import "../services/styles.css";
import "./styles.css";

const base = "/audience-innovation";
const displayDate = (value: string) =>
  new Date(value + "T12:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
const libraries = [
  { id: "research", title: "Research & Insight" },
  { id: "experiments", title: "Experiments & Testing" },
  { id: "analytics", title: "Analysis & Reporting" },
];
const libraryFor = (file: WorkingFile) =>
  file.area === "experiments"
    ? "experiments"
    : ["analytics", "decisions"].includes(file.area)
      ? "analytics"
      : "research";
const folderFor = (file: WorkingFile) => {
  if (file.area === "research") {
    const groups: Record<string, string> = {
      "Audience Segmentation Refresh": "Audience Segmentation/Research",
      "Customer Motivation Study": "Customer Journeys/Research",
      "Competitor & Market Scan": "Competitor Research/Market Scan",
      "Website Usability Study": "UX & Usability/Website Usability Study",
      "Emerging Channel Research": "Website Behaviour/Emerging Channels",
    };
    return groups[file.folder] || file.folder;
  }
  if (file.area === "audiences")
    return file.folder === "Customer Segmentation"
      ? "Audience Segmentation/Working Models"
      : `Customer Journeys/${file.folder}`;
  if (file.area === "experiments")
    return file.folder.includes("Channel") ||
      file.folder.includes("Channel-mix")
      ? `Channel Tests/${file.folder}`
      : `A-B Tests/${file.folder}`;
  if (file.area === "decisions") return `Recommendations/${file.folder}`;
  const groups: Record<string, string> = {
    "Measurement Frameworks": "Measurement/Frameworks",
    "Journey Analysis": "Measurement/Journey Analysis",
    "Website Behaviour & UX": "Website Analysis/Conversion Study",
    "Channel Analysis": "Periodic Reports/Channel Analysis",
    "Performance Analysis": "Periodic Reports/Retention",
    "Experiment Results": "Measurement/Experiment Results",
    "Predictive Analytics": "Predictive Analysis/Retention Pilot",
    "Periodic Reporting": "Periodic Reports/2026",
  };
  return groups[file.folder] || file.folder;
};
const documentFor = (file: WorkingFile): LibraryDocument => ({
  id: file.id,
  name: file.name,
  folder: folderFor(file),
  modified: file.modified,
  owner: file.owner,
  status: file.review,
  summary:
    file.id === "journey-map"
      ? journey
          .map(
            (step) =>
              `${step.stage}: ${step.behaviour}. ${step.friction}. ${step.test}.`,
          )
          .join(" ")
      : file.id === "seg-model"
        ? segments
            .map(
              (segment) =>
                `${segment.name}: ${segment.behaviour}; ${segment.motivation}.`,
            )
            .join(" ")
        : `${file.campaign}. ${initiatives.find((item) => item.id === file.initiativeId)?.question || ""}`,
  metadata: {
    "Work type": file.workType,
    Research: file.campaign,
    Sensitivity: file.sensitivity,
  },
});
const fileLink = (file: WorkingFile) =>
  `${base}/${libraryFor(file)}?file=${file.id}`;

export default function AudienceApp() {
  const [url, setUrl] = useState(
    location.pathname + location.search + location.hash,
  );
  const [items, setItems] = useState(initiatives);
  const [decisions, setDecisions] = useState(initialDecisions);
  const [message, setMessage] = useState("");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Record<string, string[]>>({});
  const [month, setMonth] = useState(new Date(2026, 9, 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
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
  const selectedFile = filesById.get(params.get("file") || "");
  const libraryId = selectedFile
    ? libraryFor(selectedFile)
    : page === "audiences"
      ? "research"
      : page === "decisions"
        ? "analytics"
        : page;
  const activeLibrary = libraries.find((library) => library.id === libraryId);
  const register =
    page === "register" ||
    (page === "research" && !!params.get("registerView")) ||
    (page === "decisions" && !!params.get("initiative"));
  const known =
    page === "home" ||
    !!activeLibrary ||
    register ||
    ["automation", "calendar"].includes(page) ||
    system ||
    protectedStudy;
  const nav = (href: string, replace = false) => {
    history[replace ? "replaceState" : "pushState"]({}, "", href);
    setUrl(location.pathname + location.search + location.hash);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
  const intercept = (event: MouseEvent<HTMLDivElement>) => {
    const href = (event.target as HTMLElement)
      .closest("a")
      ?.getAttribute("href");
    if (
      href?.startsWith(base) &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      event.preventDefault();
      nav(href);
    }
  };
  const changeParams = (changes: Record<string, string>, replace = false) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key),
    );
    nav(parsed.pathname + (next.size ? "?" + next.toString() : ""), replace);
  };
  const initiative = items.find((item) => item.id === params.get("initiative"));
  const openInitiative = (item: Initiative) =>
    changeParams({ initiative: item.id, file: "" });
  const search = params.get("search") || "";
  const requestedView = params.get("registerView") || "All research";
  const view =
    requestedView === "Innovation Pipeline" ? "Active research" : requestedView;
  const registerViews = [
    "All research",
    "Active research",
    "Experiments",
    "Decisions",
  ];
  const list = queryInitiatives(
    items,
    "All Initiatives",
    search,
    params.get("stage") || "",
    "",
  )
    .filter((item) => view !== "Experiments" || !!item.experiment)
    .filter(
      (item) => view !== "Active research" || item.status !== "Completed",
    );
  const initialFolder = activeLibrary
    ? params.get("library")
      ? ""
      : params.get("folder")
        ? folderFor(
            files.find((file) => file.folder === params.get("folder")) ||
              selectedFile ||
              files[0],
          )
        : page === "audiences"
          ? parsed.hash === "#segmentation"
            ? "Audience Segmentation"
            : parsed.hash === "#journeys"
              ? "Customer Journeys"
              : ""
          : page === "decisions"
            ? "Recommendations"
            : params.get("section") === "predictive"
              ? "Predictive Analysis/Retention Pilot"
              : params.get("section") === "framework"
                ? "Measurement/Frameworks"
                : ""
    : "";
  const setStage = (id: string, value: string) =>
    setItems(
      items.map((item) => (item.id === id ? updateStage(item, value) : item)),
    );
  const renderRegister = () => (
    <section className="service-section">
      <div className="service-section-heading">
        <h2>Research & Experiment Register</h2>
        <a href={`${base}/calendar`}>Research calendar</a>
      </div>
      <div className="service-library-toolbar">
        <label>
          View
          <select
            aria-label="Register view"
            value={registerViews.includes(view) ? view : "All research"}
            onChange={(event) =>
              changeParams({ registerView: event.target.value })
            }
          >
            {registerViews.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Stage
          <select
            aria-label="Filter stage"
            value={params.get("stage") || ""}
            onChange={(event) => changeParams({ stage: event.target.value })}
          >
            <option value="">All stages</option>
            {stages.map((stage) => (
              <option key={stage}>{stage}</option>
            ))}
          </select>
        </label>
        <Input
          contentBefore={<Search20Regular />}
          aria-label="Search register"
          placeholder="Search register"
          value={search}
          onChange={(_, data) => changeParams({ search: data.value }, true)}
        />
      </div>
      <div className="table-scroll">
        <table className="service-table">
          <thead>
            <tr>
              {(view === "Decisions"
                ? [
                    "Question",
                    "Recommendation",
                    "Owner",
                    "Status",
                    "Decision date",
                  ]
                : [
                    "Research question",
                    "Owner",
                    "Stage",
                    "Status",
                    "Review date",
                  ]
              ).map((label) => (
                <th key={label}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view === "Decisions"
              ? decisions
                  .filter((decision) =>
                    `${decision.question} ${decision.recommendation}`
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((decision) => (
                    <tr key={decision.id}>
                      <td>
                        <button
                          onClick={() =>
                            openInitiative(
                              items.find(
                                (item) => item.id === decision.initiativeId,
                              )!,
                            )
                          }
                        >
                          {decision.question}
                        </button>
                      </td>
                      <td>
                        <a href={fileLink(filesById.get(decision.evidence)!)}>
                          {decision.recommendation}
                        </a>
                      </td>
                      <td>{decision.owner}</td>
                      <td>{decision.status}</td>
                      <td>{displayDate(decision.date)}</td>
                    </tr>
                  ))
              : list.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <button onClick={() => openInitiative(item)}>
                        {item.name}
                      </button>
                    </td>
                    <td>{item.owner}</td>
                    <td>{item.stage}</td>
                    <td>{item.status}</td>
                    <td>{displayDate(item.decisionDate)}</td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!list.length && (
          <p className="empty-state">No research matches these filters.</p>
        )}
      </div>
    </section>
  );
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
        onOpen={(file) => nav(fileLink(filesById.get(file.id)!))}
        onTeams={() => {
          location.href = "/teams?staff=taylor&workspace=audience";
        }}
        onMessage={setMessage}
      />
      <div className="workspace">
        <aside className="sidebar services-sidebar">
          <nav aria-label="Audience workspace navigation">
            <a href={base} aria-current={page === "home" ? "page" : undefined}>
              <Home24Regular />
              Home
            </a>
            {libraries.map((library) => (
              <a
                key={library.id}
                href={`${base}/${library.id}`}
                aria-current={
                  !register && libraryId === library.id ? "page" : undefined
                }
              >
                <Folder24Regular />
                {library.title}
              </a>
            ))}
            <a
              href={`${base}/register`}
              aria-current={register ? "page" : undefined}
            >
              <List24Regular />
              Research & Experiment Register
            </a>
          </nav>
        </aside>
        <main className="services-main" id="audience-main">
          <div className="breadcrumb">
            <a href={base}>Workspace</a>
            {page !== "home" && (
              <>
                {" "}
                /{" "}
                {protectedStudy
                  ? "Participant administration"
                  : register
                    ? "Research & Experiment Register"
                    : activeLibrary?.title ||
                      (page === "automation"
                        ? "Marketing automation concepts"
                        : page === "calendar"
                          ? "Research calendar"
                          : "Analytics")}
              </>
            )}
          </div>
          {!known ? (
            <>
              <h2>Page not found</h2>
              <a href={base}>Return to workspace</a>
            </>
          ) : protectedStudy ? (
            <section className="service-restricted">
              <LockClosed20Regular />
              <h2>Access denied</h2>
              <h3>Website Usability Study — Participant administration</h3>
              <p>
                Contact fictional study owner Alex Morgan if you need access.
              </p>
              <a
                href={
                  "/service-desk/access-request?" +
                  new URLSearchParams({
                    workspace: title,
                    area: "Participant administration",
                    location: `${title} / Website Usability Study / Participant administration`,
                  })
                }
              >
                Request access through Freshservice
              </a>
              <p>
                <a
                  href={`${base}/research?library=Research+%26+Insight&folder=UX+%26+Usability%2FWebsite+Usability+Study`}
                >
                  Back to shared study files
                </a>
              </p>
            </section>
          ) : system ? (
            <section className="system-destination">
              <span className="external-system-label">
                <ArrowUpRight20Regular /> Analytical system preview
              </span>
              <h2>
                {parts[2] === "performance"
                  ? "Performance analytics"
                  : "Website Analytics"}
              </h2>
              <p>Synthetic aggregate data · September 2026</p>
              <table className="service-table">
                <thead>
                  <tr>
                    <th>Measure</th>
                    <th>September</th>
                    <th>Change from August</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Journey starts</td>
                    <td>9,600</td>
                    <td>+6.2%</td>
                  </tr>
                  <tr>
                    <td>Completion rate</td>
                    <td>16.2%</td>
                    <td>+1.1 percentage points</td>
                  </tr>
                  <tr>
                    <td>Mobile form drop-off</td>
                    <td>46%</td>
                    <td>−3 percentage points</td>
                  </tr>
                </tbody>
              </table>
              <p className="service-muted">
                Illustrative aggregate results. Detailed tracking remains in the
                analytics platform.
              </p>
              <a
                href={`${base}/analytics?library=Analysis+%26+Reporting&folder=Website+Analysis`}
              >
                Website analysis files
              </a>
            </section>
          ) : page === "home" ? (
            <>
              <div className="library-heading">
                <div>
                  <h2>{title}</h2>
                  <p>Research audiences, test ideas and share findings.</p>
                </div>
              </div>
              <DocumentLibrary
                title="Current research files"
                files={files
                  .filter((file) =>
                    [
                      "seg-model",
                      "signup-design",
                      "website-funnel",
                      "model-limitations",
                    ].includes(file.id),
                  )
                  .map((file) => ({ ...documentFor(file), folder: "" }))}
                embedded
              />
              <section className="service-section">
                <h3>Quick links</h3>
                <div className="audience-simple-links">
                  <a href={`${base}/register`}>
                    Research & Experiment Register
                  </a>
                  <a href={`${base}/automation`}>
                    Marketing automation concepts
                  </a>
                  <a href={`${base}/calendar`}>Research calendar</a>
                </div>
              </section>
            </>
          ) : register ? (
            renderRegister()
          ) : page === "calendar" ? (
            <>
              <h2>Research calendar</h2>
              <ResearchCalendar
                month={month}
                setMonth={setMonth}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                onInitiative={(id) =>
                  openInitiative(items.find((item) => item.id === id)!)
                }
              />
            </>
          ) : page === "automation" ? (
            <section className="service-section">
              <h2>Marketing automation concepts</h2>
              <div className="table-scroll">
                <table className="service-table">
                  <thead>
                    <tr>
                      <th>Concept</th>
                      <th>Research question</th>
                      <th>Owner</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {automationConcepts.map((concept) => (
                      <tr key={concept.name}>
                        <td>{concept.name}</td>
                        <td>{concept.question}</td>
                        <td>{concept.owner}</td>
                        <td>{concept.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="audience-simple-links">
                <a href="/content-delivery/digital">
                  Content and message requirements
                </a>
                <a href="/digital-tech/ai-automation">Digital implementation</a>
                <a href={`${base}/analytics`}>Evaluation and reporting</a>
              </div>
            </section>
          ) : activeLibrary ? (
            <>
              <DocumentLibrary
                key={activeLibrary.id + initialFolder}
                title={activeLibrary.title}
                files={files
                  .filter((file) => libraryFor(file) === activeLibrary.id)
                  .map(documentFor)}
                initialFolder={initialFolder}
              />
              {activeLibrary.id === "research" && (
                <p>
                  <a
                    className="rd-protected-link"
                    href={`${base}/research/website-usability/participant-administration`}
                  >
                    <LockClosed20Regular />
                    Participant administration
                  </a>
                </p>
              )}
              {activeLibrary.id === "analytics" && (
                <div className="audience-simple-links">
                  <a href={`${base}/systems/website-analytics`}>
                    Website Analytics
                  </a>
                  <a href={`${base}/systems/performance`}>
                    Performance analytics
                  </a>
                </div>
              )}
            </>
          ) : null}
        </main>
      </div>
      <Drawer
        open={!!initiative && !protectedStudy}
        position="end"
        size="medium"
        modalType="modal"
        onOpenChange={(_, data) => {
          if (!data.open) changeParams({ initiative: "" });
        }}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                icon={<Dismiss20Regular />}
                aria-label="Close research details"
                onClick={() => changeParams({ initiative: "" })}
              />
            }
          >
            Research details
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          {initiative && (
            <>
              <h3>{initiative.name}</h3>
              <p>{initiative.question}</p>
              <dl className="service-properties">
                {[
                  ["Owner", initiative.owner],
                  ["Audience", initiative.segment],
                  ["Channel", initiative.channel],
                  ["Primary measure", initiative.measure],
                  ["Review date", displayDate(initiative.decisionDate)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <label className="rd-stage-edit">
                Stage
                <select
                  aria-label="Initiative stage"
                  value={initiative.stage}
                  onChange={(event) =>
                    setStage(initiative.id, event.target.value)
                  }
                >
                  {stages.map((stage) => (
                    <option key={stage}>{stage}</option>
                  ))}
                </select>
              </label>
              {initiative.experiment && (
                <p>
                  {initiative.experiment.variant}
                  <br />
                  {displayDate(initiative.experiment.start)}–
                  {displayDate(initiative.experiment.end)}
                </p>
              )}
              <h4>Working files</h4>
              <div className="audience-simple-links">
                {files
                  .filter((file) => file.initiativeId === initiative.id)
                  .map((file) => (
                    <a href={fileLink(file)} key={file.id}>
                      {file.name}
                    </a>
                  ))}
              </div>
              {decisions
                .filter((decision) => decision.initiativeId === initiative.id)
                .map((decision) => (
                  <section key={decision.id}>
                    <h4>Decision</h4>
                    <p>{decision.recommendation}</p>
                    <label className="rd-stage-edit">
                      Status
                      <select
                        aria-label={`Decision status for ${decision.question}`}
                        value={decision.status}
                        onChange={(event) => {
                          const status = event.target.value;
                          setDecisions(
                            decisions.map((current) =>
                              current.id === decision.id
                                ? { ...current, status }
                                : current,
                            ),
                          );
                          setStage(
                            initiative.id,
                            status === "More evidence required"
                              ? "Analysis"
                              : status.startsWith("Approved")
                                ? "Completed"
                                : initiative.stage,
                          );
                        }}
                      >
                        {[
                          "Awaiting review",
                          "More evidence required",
                          "Approved for next stage",
                          "Approved",
                        ].map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </label>
                    <p>{decision.followup}</p>
                  </section>
                ))}
              <h4>Review comments</h4>
              <p>
                {initiative.id === "RD-104"
                  ? "Sam Patel: Review subgroup limitations before proposing operational use."
                  : "Maya Chen: Please check evidence gaps before the next review."}
              </p>
              {comments[initiative.id]?.map((text, index) => (
                <p key={index}>Maya Chen: {text}</p>
              ))}
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!comment.trim()) return;
                  setComments({
                    ...comments,
                    [initiative.id]: [
                      ...(comments[initiative.id] || []),
                      comment.trim(),
                    ],
                  });
                  setComment("");
                }}
              >
                <Input
                  aria-label="Add review comment"
                  value={comment}
                  onChange={(_, data) => setComment(data.value)}
                />
                <Button type="submit" disabled={!comment.trim()}>
                  Add comment
                </Button>
              </form>
            </>
          )}
        </DrawerBody>
      </Drawer>
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
