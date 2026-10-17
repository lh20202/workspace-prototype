import SensitivityBadge from "../sharepoint/SensitivityBadge";
import AccessLock from "../components/AccessLock";
import { canAccessWorkspace } from "../access/policy";
import WorkspaceDenied from "../access/WorkspaceDenied";
import StaffLink from "../components/StaffLink";
import { withExplicitStaff } from "../utils/staffNavigation";
import { useEffect, useState, type MouseEvent } from "react";
import AccessBoundary from "../access/AccessBoundary";
import PocAnnotation from "../components/PocAnnotation";
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
  ArrowRight20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
} from "@fluentui/react-icons";
import WorkspaceHeader from "../logistics/WorkspaceHeader";
import { resolveStaffPerson } from "../intranet/catalog";
import DocumentLibrary from "../sharepoint/DocumentLibrary";
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
import {
  libraries,
  libraryFor,
  folderFor,
  documentFor,
  definitions,
} from "./libraries";
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
  const person = resolveStaffPerson(params.get("staff"));
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
    history[replace ? "replaceState" : "pushState"](
      {},
      "",
      withExplicitStaff(href),
    );
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
        <StaffLink href={`${base}/calendar`}>Research calendar</StaffLink>
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
                        <StaffLink
                          href={fileLink(filesById.get(decision.evidence)!)}
                        >
                          {decision.recommendation}
                        </StaffLink>
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
  if (!canAccessWorkspace(person, "audience"))
    return (
      <WorkspaceDenied
        workspaceId="audience"
        known={!!known}
        resource={
          protectedStudy
            ? {
                kind: "area",
                workspaceId: "audience",
                areaId: "participant-administration",
              }
            : undefined
        }
      />
    );
  return (
    <div className="app-shell services-app audience-app" onClick={intercept}>
      <StaffLink className="skip-link" href="#audience-main">
        Skip to content
      </StaffLink>
      <WorkspaceHeader
        title={title}
        userName={person.name}
        userRole={person.role}
        searchFiles={files}
        memberCount={18}
        helpText={description}
        onOpen={(file) => nav(fileLink(filesById.get(file.id)!))}
        onMessage={setMessage}
      />
      <div className="workspace">
        <aside className="sidebar services-sidebar">
          <nav aria-label="Audience workspace navigation">
            <StaffLink
              href={base}
              aria-current={page === "home" ? "page" : undefined}
            >
              <Home24Regular />
              Home
            </StaffLink>
            {libraries.map((library) => (
              <StaffLink
                key={library.id}
                href={`${base}/${library.id}`}
                aria-current={
                  !register && libraryId === library.id ? "page" : undefined
                }
              >
                <Folder24Regular />
                {library.title}
              </StaffLink>
            ))}
            <StaffLink
              href={`${base}/register`}
              aria-current={register ? "page" : undefined}
            >
              <List24Regular />
              Research & Experiment Register
            </StaffLink>
          </nav>
        </aside>
        <main className="services-main" id="audience-main">
          <div className="breadcrumb">
            <StaffLink href={base}>Workspace</StaffLink>
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
              <StaffLink href={base}>Return to workspace</StaffLink>
            </>
          ) : protectedStudy ? (
            <AccessBoundary
              workspaceId="audience"
              resource={{
                kind: "area",
                workspaceId: "audience",
                areaId: "participant-administration",
              }}
              area="Website Usability Study — Participant administration"
              location={`${title} / Website Usability Study / Participant administration`}
              headingLevel={2}
              personId={person.id}
              returnHref={withExplicitStaff(
                `${base}/research?library=Research+%26+Insight&folder=UX+%26+Usability%2FWebsite+Usability+Study`,
              )}
              returnLabel="Back to shared study files"
              strict
            />
          ) : system ? (
            <section className="system-destination">
              <PocAnnotation title="System preview" variant="inline">
                Fictional analytics destination
              </PocAnnotation>
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
              <PocAnnotation title="Test data" variant="inline">
                Illustrative aggregate results. Detailed tracking remains in the
                analytics platform.
              </PocAnnotation>
              <StaffLink
                href={`${base}/analytics?library=Analysis+%26+Reporting&folder=Website+Analysis`}
              >
                Website analysis files
              </StaffLink>
            </section>
          ) : page === "home" ? (
            <>
              <div className="library-heading">
                <div>
                  <h2>{title}</h2>
                  <p>Research audiences, test ideas and share findings.</p>
                </div>
              </div>
              <section className="service-section">
                <h3>Research ready for a decision</h3>
                <p>
                  Audience Segmentation Refresh · synthesis review on 23
                  October.
                </p>
                <div className="audience-simple-links">
                  <StaffLink href={`${base}/research?file=seg-synthesis`}>
                    Review the findings
                  </StaffLink>
                  <StaffLink href={`${base}/register?view=Ready+for+Review`}>
                    Experiments awaiting review
                  </StaffLink>
                </div>
              </section>
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
                  .map(documentFor)}
                embedded
              />
              <p>
                <StaffLink href="/content-delivery/production">
                  Hand approved audience recommendations to content production →
                </StaffLink>
              </p>
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
                <StaffLink href="/content-delivery/digital">
                  Content and message requirements
                </StaffLink>
                <StaffLink href="/digital-tech/ai-automation">
                  Digital implementation
                </StaffLink>
                <StaffLink href={`${base}/analytics`}>
                  Evaluation and reporting
                </StaffLink>
              </div>
            </section>
          ) : activeLibrary ? (
            <>
              <DocumentLibrary
                key={activeLibrary.id + initialFolder}
                title={activeLibrary.title}
                definition={definitions[activeLibrary.id]}
                files={files
                  .filter((file) => libraryFor(file) === activeLibrary.id)
                  .map(documentFor)}
                initialFolder={initialFolder}
              />
              {activeLibrary.id === "research" && (
                <p>
                  <StaffLink
                    className="rd-protected-link"
                    href={`${base}/research/website-usability/participant-administration`}
                  >
                    <AccessLock />
                    Participant administration
                  </StaffLink>
                </p>
              )}
              {activeLibrary.id === "analytics" && (
                <div className="audience-simple-links">
                  <StaffLink href={`${base}/systems/website-analytics`}>
                    Website Analytics
                  </StaffLink>
                  <StaffLink href={`${base}/systems/performance`}>
                    Performance analytics
                  </StaffLink>
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
                    <StaffLink href={fileLink(file)} key={file.id}>
                      {file.name}
                      <SensitivityBadge value={file.sensitivity} />
                    </StaffLink>
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
      <PocAnnotation title="Calendar preview" variant="inline">
        Fictional scheduling example · October 2026. Session links open the same
        initiative used in the register.
      </PocAnnotation>
    </>
  );
}
