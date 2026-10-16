import { useState } from "react";
import {
  LockClosed16Regular,
  PeopleTeam20Regular,
} from "@fluentui/react-icons";
import WorkspaceHeader from "../logistics/WorkspaceHeader";
import DocumentIcon from "../components/DocumentIcon";
import { staff, rememberStaff } from "../intranet/catalog";
import {
  allProjects,
  currentProjects,
  archivedProjects,
  archivePeriods,
  projectTitle,
  projectHref,
  activePerson,
  canOpenProject,
  controlRoles,
  supportRoles,
  projectFiles,
  projectAccessHref,
  reviewRows,
  type Project,
} from "./data";
import "./styles.css";
const centralNav = [
  ["home", "Home"],
  ["control", "Project Control"],
  ["support", "Project Support"],
  ["reviews", "Project Reviews"],
];
const projectNav = [
  ["home", "Home"],
  ["plan", "Project Plan"],
  ["documents", "Working Documents"],
  ["decisions", "Decisions & Actions"],
  ["risks", "Risks & Issues"],
  ["handover", "Delivery & Handover"],
];
export default function ProjectsApp() {
  const parts = location.pathname.split("/").filter(Boolean);
  const archived = parts[1] === "archive";
  const project = allProjects.find((p) => p.code === parts[archived ? 2 : 1]);
  const page = project ? parts[archived ? 3 : 2] || "home" : parts[1] || "home";
  const [personId, setPersonId] = useState(
    () =>
      new URLSearchParams(location.search).get("staff") || activePerson().id,
  );
  const person = staff.find((s) => s.id === personId) || activePerson();
  const permitted = !project || canOpenProject(project, person.id);
  const [query, setQuery] = useState(""),
    [preview, setPreview] = useState<ReturnType<typeof projectFiles>[number]>(),
    [states, setStates] = useState<Record<string, string>>({}),
    [channel, setChannel] = useState("General"),
    [tab, setTab] = useState("Posts"),
    [note, setNote] = useState(""),
    [notes, setNotes] = useState<string[]>([]);
  const teams = page === "teams";
  const title = project ? projectTitle(project) : "Projects";
  const root = project ? projectHref(project) : "/projects";
  const readOnly = !!project?.archived;
  const mode = project ? projectNav : centralNav;
  const canControl = controlRoles.includes(person.id),
    canSupport = supportRoles.includes(person.id);
  const blockedCentral =
    !project &&
    (((page === "control" || page === "reviews") && !canControl) ||
      (page === "support" && !canSupport));
  const setState = (key: string, value: string) =>
    setStates({ ...states, [key]: value });
  const status = (
    key: string,
    initial: string,
    options = ["Not started", "In progress", "Needs review", "Complete"],
  ) =>
    readOnly ? (
      <span>{initial}</span>
    ) : (
      <select
        aria-label={key}
        value={states[key] || initial}
        onChange={(e) => setState(key, e.target.value)}
      >
        {[...new Set([initial, ...options])].map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
    );
  const access = (p: Project) => (
    <span className="project-access">
      {p.access === "Restricted" ? (
        <LockClosed16Regular />
      ) : (
        <PeopleTeam20Regular />
      )}
      {p.access}
    </span>
  );
  const table = (headers: string[], rows: React.ReactNode[][]) => (
    <div className="project-table-scroll">
      <table className="project-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  const link = (p: Project) => <a href={projectHref(p)}>{projectTitle(p)}</a>;
  const projectList = (list: Project[], full = false) =>
    table(
      full
        ? [
            "Project",
            "Sponsor / Lead",
            "Stage",
            "Status",
            "Start",
            "Target end",
            "Next review",
            "Business area",
            "Delivery workspace",
            "Access",
          ]
        : ["Project", "Stage", "Status", "Next review", "Access"],
      list.map((p) => {
        const safe = canOpenProject(p, person.id);
        return full
          ? [
              link(p),
              safe ? `${p.sponsor} / ${p.lead}` : "Restricted",
              safe ? p.stage : "Restricted",
              safe ? p.status : "Restricted",
              safe ? "2026-09-01" : "—",
              safe ? p.end : "—",
              safe ? "2026-10-26" : "—",
              safe ? p.area : "—",
              safe ? <a href={p.delivery}>Open delivery owner ↗</a> : "—",
              access(p),
            ]
          : [
              link(p),
              safe ? p.stage : "Restricted",
              safe ? p.status : "Restricted",
              safe ? "2026-10-26" : "—",
              access(p),
            ];
      }),
    );
  const documents = project && permitted ? projectFiles(project) : [];
  const filesView = () => (
    <>
      <h2>Working Documents</h2>
      {documents.map((f) => (
        <button
          key={f.id}
          className="project-file"
          onClick={() => setPreview(f)}
        >
          <DocumentIcon name={f.name} />
          {f.name}
        </button>
      ))}
      {preview && (
        <section
          className="project-preview"
          role="dialog"
          aria-label="Project document preview"
        >
          <button onClick={() => setPreview(undefined)}>Close preview</button>
          <h2>{preview.name}</h2>
          <p>{preview.summary}</p>
          <p>
            {title} ·{" "}
            {readOnly ? "Closed · Read-only" : "Working coordination material"}
          </p>
        </section>
      )}
    </>
  );
  const reviews = () =>
    table(
      [
        "Project",
        "Review type",
        "Review date",
        "Decision required",
        "Reviewer",
        "Outcome / follow-up",
        "Status",
      ],
      reviewRows
        .filter((r) => canOpenProject(r.project, person.id))
        .map((r) => [
          link(r.project),
          r.type,
          r.date,
          r.decision,
          r.reviewer,
          "Decision pending · update project decision log",
          status("Review " + r.project.code, r.status, [
            "Scheduled",
            "In review",
            "Decision returned",
            "Complete",
          ]),
        ]),
    );
  const denied = () => (
    <section className="project-restricted">
      <LockClosed16Regular />
      <h1>Access required</h1>
      <p>
        {project
          ? "This project workspace has restricted membership."
          : "This working area requires a project-control or project-support role."}
      </p>
      {project && (
        <p>
          Project: <strong>{title}</strong>
        </p>
      )}
      <a
        className="project-primary"
        href={
          project
            ? projectAccessHref(project, person.id)
            : `/service-desk/access-request?workspace=Projects&area=${encodeURIComponent(title + " / " + page)}&person=${person.id}`
        }
      >
        Request access
      </a>
      <a href="/projects">Back to Projects</a>
    </section>
  );
  const projectBody = () => {
    if (!project) return null;
    if (!permitted) return denied();
    if (page === "security")
      return (
        <section className="project-restricted">
          <h1>Access required</h1>
          <p>
            Production Security Review requires separate technical
            authorisation. No review contents are included.
          </p>
          <a href={projectAccessHref(project, person.id)}>Request access</a>
        </section>
      );
    if (page === "documents") return filesView();
    if (page === "plan")
      return (
        <>
          <h1>Project Plan</h1>
          {table(
            [
              "Deliverable / milestone",
              "Owner",
              "Start",
              "Due",
              "Status",
              "Dependency",
              "Decision required",
            ],
            [
              "Confirm scope and acceptance",
              "Review delivery options",
              "Complete acceptance review",
              "Operational handover",
            ].map((x, i) => [
              x,
              project.lead,
              "2026-10-01",
              ["2026-10-23", "2026-11-06", "2026-11-20", project.end][i],
              status(
                "Milestone " + i,
                readOnly ? "Complete" : i === 0 ? "Complete" : "In progress",
              ),
              i ? "Previous milestone" : "Business requirements",
              i === 1 ? "Stage decision" : "—",
            ]),
          )}
        </>
      );
    if (page === "decisions")
      return (
        <>
          <h1>Decisions & Actions</h1>
          <h2>Decision Log</h2>
          {table(
            [
              "Decision",
              "Date",
              "Decision maker",
              "Context",
              "Outcome",
              "Follow-up",
            ],
            [
              [
                "Confirm delivery option",
                "2026-10-21",
                project.sponsor,
                "Stage review",
                readOnly ? "Approved" : "Pending",
                "Update delivery plan",
              ],
              [
                "Accept transition",
                "2026-11-20",
                project.lead,
                "Operational readiness",
                readOnly ? "Accepted" : "Pending",
                "Confirm handover owner",
              ],
            ],
          )}
          <h2>Action Register</h2>
          {table(
            ["Action", "Owner", "Due", "Status", "Dependency"],
            [
              [
                "Confirm acceptance criteria",
                project.lead,
                "2026-10-23",
                status(
                  "Acceptance action",
                  readOnly ? "Complete" : "In progress",
                ),
                "Functional owner review",
              ],
              [
                "Resolve handoff dependency",
                project.lead,
                "2026-10-26",
                status(
                  "Handoff action",
                  readOnly ? "Complete" : "Needs review",
                ),
                "Stage decision",
              ],
            ],
          )}
          {!readOnly && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (note.trim()) {
                  setNotes([...notes, note.trim()]);
                  setNote("");
                }
              }}
            >
              <label>
                Decision follow-up note
                <input
                  className="project-search"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  required
                />
              </label>
              <button>Add note</button>
            </form>
          )}
          {notes.map((n, i) => (
            <p key={i}>
              {person.name}: {n}
            </p>
          ))}
        </>
      );
    if (page === "risks")
      return (
        <>
          <h1>Risks & Issues</h1>
          {table(
            [
              "ID",
              "Type",
              "Description",
              "Owner",
              "Impact",
              "Status",
              "Response",
              "Due",
            ],
            [
              [
                "R-014",
                "Risk",
                "Business acceptance may need more review time",
                project.lead,
                "Transition delay",
                status("Risk R-014", readOnly ? "Closed" : "Open", [
                  "Open",
                  "Mitigating",
                  "Closed",
                ]),
                "Arrange focused acceptance session",
                "2026-10-26",
              ],
              [
                "I-008",
                "Issue",
                "Handoff owner confirmation outstanding",
                project.lead,
                "Dependency unresolved",
                status("Issue I-008", readOnly ? "Closed" : "Open", [
                  "Open",
                  "In progress",
                  "Closed",
                ]),
                "Confirm ownership with delivery workspace",
                "2026-10-23",
              ],
            ],
          )}
        </>
      );
    if (page === "handover")
      return (
        <>
          <h1>Delivery & Handover</h1>
          {table(
            ["Transition item", "Owner", "Status", "Next action"],
            [
              "Acceptance",
              "Handover",
              "Operational readiness",
              "Outstanding actions",
              "Benefits follow-up",
              "Closure recommendation",
              "Closure report",
              "Archive transfer",
            ].map((x) => [
              x,
              project.lead,
              status(x, readOnly ? "Complete" : "Needs review"),
              "Confirm final evidence and accountable owner",
            ]),
          )}
          <p>
            Records disposition:{" "}
            {project.archived === "Transferred to Archive"
              ? "Transferred to Company Archives"
              : "Final records selection awaits appraisal"}
          </p>
          <a
            href={
              project.archived === "Transferred to Archive"
                ? "/archives/collections?collection=Project%20Memory&record=ARC-PRJ-2024-018"
                : "/archives/transfer"
            }
          >
            {project.archived === "Transferred to Archive"
              ? "View archive record"
              : "Request appraisal and archival transfer"}{" "}
            ↗
          </a>
        </>
      );
    return (
      <>
        <h1>{title}</h1>
        <p>{project.purpose}</p>
        <div className="project-metadata">
          <span>
            Sponsor<strong>{project.sponsor}</strong>
          </span>
          <span>
            Project lead<strong>{project.lead}</strong>
          </span>
          <span>
            Stage<strong>{project.stage}</strong>
          </span>
          <span>
            Status<strong>{project.status}</strong>
          </span>
          <span>
            Target end<strong>{project.end}</strong>
          </span>
          {access(project)}
        </div>
        {readOnly && (
          <p className="project-readonly">
            {project.archived} · Read-only. Closure history and selected final
            records only.
          </p>
        )}
        <div className="project-columns">
          <section>
            <h2>Next milestones</h2>
            <p>
              Acceptance review · 20 November
              <br />
              Operational handover · {project.end}
            </p>
            <a href={`${root}/plan`}>Open Project Plan →</a>
            <h2>Decisions & attention</h2>
            <p>
              {readOnly
                ? "Final delivery and transition decisions recorded."
                : "Confirm delivery option and resolve handoff ownership before the next review."}
            </p>
            <a href={`${root}/decisions`}>Open Decisions & Actions →</a>
            <p>
              <a href={`${root}/risks`}>Review Risks & Issues →</a>
            </p>
          </section>
          <section>
            <h2>Current work</h2>
            <div className="project-link-list">
              <a href={`${root}/documents`}>Continue working documents →</a>
              <a href={project.delivery}>
                Substantive delivery work · {project.area} ↗
              </a>
              <a href="/executive/initiatives">
                Stage decision / escalation → Strategic Initiatives ↗
              </a>
              <a href="/financial-operations/planning">
                Funding / forecast implication ↗
              </a>
              <a href="/quality-monitoring/reviews">
                Evaluate improvement outcome ↗
              </a>
              <a href={`${root}/handover`}>Delivery & Handover →</a>
              {!readOnly && (
                <a href={`${root}/security`}>
                  Production Security Review <LockClosed16Regular />
                </a>
              )}
            </div>
          </section>
        </div>
      </>
    );
  };
  const searchResults = query.trim() ? (
    <section>
      <h2>Search Projects</h2>
      {allProjects
        .filter((p) =>
          projectTitle(p).toLowerCase().includes(query.toLowerCase()),
        )
        .map((p) => (
          <p key={p.code}>
            {link(p)} · {access(p)}
          </p>
        ))}
      {[
        [
          "Project Control · Stage decisions, dependencies, escalations and closure",
          "control",
        ],
        [
          "Project Support · Facilitate risk workshop, review delivery plan, prepare stage review, support closure",
          "support",
        ],
        [
          "Project Reviews · Initiation, planning, delivery, stage and closure reviews",
          "reviews",
        ],
      ]
        .filter(([x]) => x.toLowerCase().includes(query.toLowerCase()))
        .map(([x, href]) => (
          <p key={x}>
            <a href={"/projects/" + href}>{x}</a>
          </p>
        ))}
    </section>
  ) : null;
  const centralBody = () => {
    if (blockedCentral) return denied();
    if (page === "control")
      return (
        <>
          <h1>Project Control</h1>
          {projectList(currentProjects, true)}
          <h2>Stage decisions, dependencies & closure</h2>
          <p>
            Review escalations against the original project plan; return
            decisions to the project owner.
          </p>
          <div className="project-link-list">
            {currentProjects
              .filter((p) => canOpenProject(p, person.id))
              .map((p) => (
                <a key={p.code} href={projectHref(p) + "/decisions"}>
                  {projectTitle(p)} · Review decisions / dependencies /
                  ownership →
                </a>
              ))}
          </div>
        </>
      );
    if (page === "reviews")
      return (
        <>
          <h1>Project Reviews</h1>
          {reviews()}
        </>
      );
    if (page === "support")
      return (
        <>
          <h1>Project Support</h1>
          {table(
            [
              "Project",
              "Support activity",
              "Owner",
              "Due",
              "Status",
              "Contextual method",
            ],
            [
              currentProjects[1],
              currentProjects[3],
              currentProjects[4],
              currentProjects[6],
            ].map((p, i) => [
              link(p),
              [
                "Facilitate risk workshop",
                "Review delivery plan",
                "Prepare stage review",
                "Support closure approach",
              ][i],
              "Casey Blake",
              "2026-10-26",
              status("Support " + p.code, "In progress"),
              <a
                href={
                  projectHref(p) +
                  ["/risks", "/plan", "/decisions", "/handover"][i]
                }
              >
                {
                  [
                    "Risk Register Template",
                    "Project Brief Template",
                    "Decision Log Template",
                    "Closure Checklist",
                  ][i]
                }{" "}
                · Apply in project →
              </a>,
            ]),
          )}
        </>
      );
    if (page === "archive")
      return (
        <>
          <h1>Project Archives</h1>
          <p>
            Completed project workspaces and closure history. Formal retention
            and preservation remain with Company Archives.
          </p>
          {archivePeriods.map((period) => (
            <details key={period}>
              <summary>
                <h2 style={{ display: "inline-block" }}>{period}</h2>
              </summary>
              {projectList(archivedProjects.filter((p) => p.period === period))}
            </details>
          ))}
          <p>
            <a href="/archives">
              Company Archives · Appraisal, retention and preservation ↗
            </a>
          </p>
        </>
      );
    return (
      <>
        <h1>Projects</h1>
        <p>
          Shared workspace for project control, delivery support and access to
          current and completed project workspaces.
        </p>
        <h2>Current Projects</h2>
        {projectList(currentProjects)}
        <div className="project-columns">
          <section>
            <h2>Upcoming reviews & attention</h2>
            {currentProjects
              .filter(
                (p) =>
                  canOpenProject(p, person.id) &&
                  p.status === "Attention Needed",
              )
              .map((p) => (
                <p key={p.code}>
                  {link(p)}
                  <br />
                  Confirm the stage decision and next handoff · 26 October
                </p>
              ))}
            <a href="/projects/reviews">Project Reviews →</a>
          </section>
          <section>
            <h2>Continue project work</h2>
            <div className="project-link-list">
              <a href="/projects/control">Project Control →</a>
              <a href="/projects/support">Project Support →</a>
              <a href="/projects/archive">Project Archives →</a>
              <a href="/quality-monitoring/improvement">
                Develop an improvement need before formal project initiation ↗
              </a>
            </div>
          </section>
        </div>
      </>
    );
  };
  return (
    <div className="projects-app">
      {teams ? (
        <header className="project-teams-header">
          <img src="/images/teams-logo.svg" alt="Microsoft Teams" />
          <strong>{title}</strong>
          <label>
            Preview as{" "}
            <select
              aria-label="Teams project staff preview"
              value={person.id}
              onChange={(e) => {
                rememberStaff(e.target.value);
                setPersonId(e.target.value);
                setPreview(undefined);
              }}
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </header>
      ) : (
        <WorkspaceHeader
          title={title}
          userName={person.name}
          searchFiles={[]}
          onSearchChange={setQuery}
          onOpen={() => {}}
          onTeams={() =>
            location.assign(
              project
                ? `${root}/teams`
                : "/teams?workspace=projects&staff=" + person.id,
            )
          }
          onMessage={(m) => window.alert(m)}
        />
      )}
      <div className="projects-layout">
        <aside className="projects-nav">
          <label>
            Preview as
            <select
              aria-label="Project staff preview"
              value={person.id}
              onChange={(e) => {
                rememberStaff(e.target.value);
                setPersonId(e.target.value);
                setPreview(undefined);
              }}
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <nav aria-label="Projects navigation">
            {project && <a href="/projects">← Back to Projects</a>}
            {mode.map(([id, label]) => (
              <a
                key={id}
                href={id === "home" ? root : `${root}/${id}`}
                aria-current={page === id ? "page" : undefined}
              >
                {label}
              </a>
            ))}
            {!project && (
              <>
                <details>
                  <summary>Current Projects</summary>
                  {currentProjects.map((p) => (
                    <a key={p.code} href={projectHref(p)}>
                      {projectTitle(p)}{" "}
                      {p.access === "Restricted" && <LockClosed16Regular />}
                    </a>
                  ))}
                </details>
                <a href="/projects/archive">Project Archives</a>
              </>
            )}
          </nav>
        </aside>
        <main className="projects-main">
          <small>
            <a href="/projects">Projects</a>
            {project ? " / " + title : ""} / {page}
          </small>
          <input
            className="project-search"
            aria-label="Search Projects"
            placeholder="Search project titles, control, reviews or support"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {searchResults ||
            (teams && project ? (
              permitted ? (
                <>
                  <h1>{title}</h1>
                  <div className="project-channel-nav">
                    {["General", "Project Delivery", "Decisions & Actions"].map(
                      (c) => (
                        <button
                          key={c}
                          aria-pressed={channel === c}
                          onClick={() => setChannel(c)}
                        >
                          {c}
                        </button>
                      ),
                    )}
                  </div>
                  <div className="project-channel-nav">
                    {["Posts", "Shared"].map((t) => (
                      <button
                        key={t}
                        aria-pressed={tab === t}
                        onClick={() => setTab(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  {tab === "Shared" ? (
                    filesView()
                  ) : (
                    <>
                      <h2>{channel}</h2>
                      <p>
                        <strong>{project.lead}</strong> · 10:15
                      </p>
                      <p>
                        {channel === "Decisions & Actions"
                          ? "Please record the stage decision and follow-up in the same project decision log."
                          : channel === "Project Delivery"
                            ? "The handoff review is ready. Please review the delivery plan before our next milestone."
                            : "Project coordination stays here; substantive delivery work stays with the functional owner."}
                      </p>
                      <a
                        href={`${root}/${channel === "Decisions & Actions" ? "decisions" : "plan"}`}
                      >
                        Open current project work →
                      </a>
                    </>
                  )}
                </>
              ) : (
                denied()
              )
            ) : project ? (
              projectBody()
            ) : (
              centralBody()
            ))}
        </main>
      </div>
    </div>
  );
}
