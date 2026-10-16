import { useEffect, useState } from "react";
import {
  LockClosed16Regular,
  PeopleTeam20Regular,
  Chat20Regular,
} from "@fluentui/react-icons";
import WorkspaceHeader from "../logistics/WorkspaceHeader";
import TeamsShell, { TeamsComposer } from "../teams/TeamsShell";
import { teamsGroups } from "../teams/navigation";
import { canSeeProject, projectChannels } from "../teams/visibility";
import TeamsAdministration from "../teams/Administration";
import DocumentIcon from "../components/DocumentIcon";
import "../teams/integrations.css";
import DocumentLibrary from "../sharepoint/DocumentLibrary";
import type { LibraryDocument } from "../sharepoint/library";
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
  projectLibraryDefinition,
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
  ["documents", "Project Documents"],
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
    [states, setStates] = useState<Record<string, string>>({}),
    [channel, setChannel] = useState(
      () => new URLSearchParams(location.search).get("channel") || "General",
    ),
    [tab, setTab] = useState(() =>
      new URLSearchParams(location.search).get("tab") === "Shared"
        ? "Shared"
        : "Posts",
    ),
    [projectDraft, setProjectDraft] = useState(""),
    [projectReply, setProjectReply] = useState(""),
    [replyOpen, setReplyOpen] = useState(false),
    [projectReplies, setProjectReplies] = useState<
      { channel: string; text: string }[]
    >([]),
    [likedChannels, setLikedChannels] = useState<string[]>([]),
    [projectPosts, setProjectPosts] = useState<
      { channel: string; text: string }[]
    >([]),
    [note, setNote] = useState(""),
    [notes, setNotes] = useState<string[]>([]),
    [projectView, setProjectView] = useState("All projects");
  const teams = page === "teams";
  useEffect(() => {
    const restoreTeamsLocation = () => {
      const params = new URLSearchParams(location.search);
      setChannel(params.get("channel") || "General");
      setTab(params.get("tab") === "Shared" ? "Shared" : "Posts");
      setProjectDraft("");
      setProjectReply("");
      setReplyOpen(false);
    };
    window.addEventListener("popstate", restoreTeamsLocation);
    return () => window.removeEventListener("popstate", restoreTeamsLocation);
  }, []);
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
  const projectList = (list: Project[], full = false) => (
    <>
      {" "}
      <div className="project-list-toolbar">
        <select
          aria-label="Project view"
          value={projectView}
          onChange={(e) => setProjectView(e.target.value)}
        >
          {["All projects", "Needs attention", "Restricted"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </div>
      {table(
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
        list
          .filter(
            (p) =>
              projectView === "All projects" ||
              (projectView === "Restricted"
                ? p.access === "Restricted"
                : canOpenProject(p, person.id) &&
                  ["Attention Needed", "At Risk"].includes(p.status)),
          )
          .map((p) => {
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
      )}
    </>
  );
  const documents = project && permitted ? projectFiles(project) : [];
  const libraryFiles: LibraryDocument[] = documents;
  const filesView = (embedded = false, initialFolder?: string) => (
    <DocumentLibrary
      title="Project Documents"
      definition={projectLibraryDefinition}
      files={libraryFiles}
      readOnly={readOnly}
      embedded={embedded}
      initialFolder={initialFolder}
      headingLevel={page === "handover" || page === "teams" ? 2 : undefined}
    />
  );
  const centralFiles = (kind: "control" | "support"): LibraryDocument[] =>
    kind === "control"
      ? [
          {
            id: "PRJ-CONTROL-1",
            name: "Project Review Agenda.docx",
            folder: "Portfolio Reviews/October 2026",
            owner: "Casey Blake",
            modified: "16 Oct 2026",
            status: "In review",
          },
          {
            id: "PRJ-CONTROL-2",
            name: "Stage Decision Notes.docx",
            folder: "Stage Reviews/October 2026",
            owner: "Robin Avery",
            modified: "16 Oct 2026",
            status: "Current",
          },
          {
            id: "PRJ-CONTROL-3",
            name: "Closure Review Checklist.docx",
            folder: "Closure/2026",
            owner: "Casey Blake",
            modified: "15 Oct 2026",
            status: "Current",
          },
        ]
      : [
          currentProjects[1],
          currentProjects[3],
          currentProjects[4],
          currentProjects[6],
        ].map((p, i) => ({
          id: `PRJ-SUPPORT-${p.code}`,
          name: [
            "Risk Workshop Agenda.docx",
            "Delivery Plan Review.docx",
            "Stage Review Notes.docx",
            "Closure Approach.docx",
          ][i],
          folder: projectTitle(p) + "/Current support",
          owner: "Casey Blake",
          modified: "16 Oct 2026",
          status: "In progress",
          summary: [
            "Facilitate the project risk workshop.",
            "Review the delivery plan with the project lead.",
            "Prepare the next stage review.",
            "Agree the closure approach and final records.",
          ][i],
        }));
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
          {filesView(false, "Planning")}
          <details className="project-secondary-list">
            <summary>Milestones</summary>
            {table(
              ["Milestone", "Owner", "Due", "Status"],
              [
                "Confirm scope and acceptance",
                "Review delivery options",
                "Complete acceptance review",
                "Operational handover",
              ].map((x, i) => [
                x,
                project.lead,
                ["2026-10-23", "2026-11-06", "2026-11-20", project.end][i],
                status(
                  "Milestone " + i,
                  readOnly ? "Complete" : i === 0 ? "Complete" : "In progress",
                ),
              ]),
            )}
          </details>
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
          {filesView(false, "Closure")}
          <details className="project-secondary-list">
            <summary>Closure checklist</summary>
            {table(
              ["Item", "Owner", "Status"],
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
              ]),
            )}
          </details>
          <p>
            <a
              href={
                project.archived === "Transferred to Archive"
                  ? "/archives/collections?collection=Project%20Memory&record=ARC-PRJ-2024-018"
                  : "/archives/transfer"
              }
            >
              {project.archived === "Transferred to Archive"
                ? "View archive record"
                : "Appraisal and transfer"}{" "}
              ↗
            </a>
          </p>
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
        {filesView(true)}
        <section>
          <h2>Quick links</h2>
          <div className="project-context-links">
            <a href={project.delivery}>{project.area} ↗</a>
            <a href={`${root}/decisions`}>Decisions & Actions</a>
            <a href={`${root}/risks`}>Risks & Issues</a>
            <a href={`${root}/handover`}>Delivery & Handover</a>
            <a href="/executive/initiatives">Stage decision ↗</a>
            <a href="/financial-operations/planning">Funding / forecast ↗</a>
            {!readOnly && (
              <a href={`${root}/security`}>
                Production Security Review <LockClosed16Regular />
              </a>
            )}
          </div>
        </section>
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
        ["Project Control", "control"],
        ["Project Support", "support"],
        ["Project Reviews", "reviews"],
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
          <DocumentLibrary
            title="Project Control"
            files={centralFiles("control")}
          />
          <p>
            <a href="/projects/reviews">Project Reviews</a> ·{" "}
            <a href="/projects/current">Current Projects</a>
          </p>
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
        <DocumentLibrary
          title="Project Support"
          files={centralFiles("support")}
        />
      );
    if (page === "current")
      return (
        <>
          <h1>Current Projects</h1>
          {projectList(currentProjects)}
        </>
      );
    if (page === "archive")
      return (
        <>
          <h1>Project Archives</h1>
          <p>Completed project workspaces and closure history.</p>
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
        <h2>
          <a href="/projects/current">Current Projects</a>
        </h2>
        {projectList(currentProjects)}
        <section>
          <h2>Quick links</h2>
          <div className="project-context-links">
            <a href="/projects/control">Project Control</a>
            <a href="/projects/support">Project Support</a>
            <a href="/projects/reviews">Project Reviews</a>
            <a href="/projects/archive">Project Archives</a>
          </div>
        </section>
      </>
    );
  };
  if (teams && project) {
    const selectedChannel = projectChannels.includes(channel)
      ? channel
      : "General";
    const changeTeamsLocation = (nextChannel: string, nextTab: string) => {
      setChannel(nextChannel);
      setTab(nextTab);
      setProjectDraft("");
      setProjectReply("");
      setReplyOpen(false);
      const params = new URLSearchParams({
        staff: person.id,
        channel: nextChannel,
        tab: nextTab,
      });
      history.pushState({}, "", `${root}/teams?${params}`);
    };
    return (
      <TeamsShell
        userName={person.name}
        teamName={title}
        channelName={selectedChannel}
        privateChannel={project.access === "Restricted"}
        groups={teamsGroups(person).map((group) =>
          group.id === project.code
            ? {
                ...group,
                channels: group.channels.map((item) => ({
                  ...item,
                  onSelect: () => changeTeamsLocation(item.label, "Posts"),
                })),
              }
            : group,
        )}
        navigationFooter={
          <TeamsAdministration person={person} groups={teamsGroups(person)} />
        }
        selectedChannelId={`${project.code}:${selectedChannel}`}
        activeTab={tab}
        onTabChange={(next) => changeTeamsLocation(selectedChannel, next)}
        onOpenSharePoint={
          !canSeeProject(person, project.code) || !permitted
            ? undefined
            : () => {
                if (tab !== "Shared") {
                  location.assign(root);
                  return;
                }
                const params = new URLSearchParams(location.search);
                params.delete("channel");
                params.delete("tab");
                location.assign(`${root}/documents?${params}`);
              }
        }
        searchValue={query}
        onSearchChange={setQuery}
        searchResults={
          canSeeProject(person, project.code) && permitted
            ? searchResults
            : undefined
        }
      >
        <div
          className={`teams-project-content ${tab === "Posts" ? "teams-conversation" : ""}`}
        >
          {!canSeeProject(person, project.code) ? (
            <section className="m365-teams-empty">
              <h2>Access denied</h2>
              <p>This project team is limited to its assigned members.</p>
              <button
                onClick={() => location.assign(`/teams?staff=${person.id}`)}
              >
                Open your Teams view
              </button>
            </section>
          ) : !permitted ? (
            denied()
          ) : tab === "Shared" ? (
            filesView()
          ) : (
            <>
              {readOnly && (
                <p className="teams-readonly">
                  This project is archived. Conversations and files are read
                  only.
                </p>
              )}
              <article className="teams-post">
                <div className="post-top">
                  <span className="post-avatar" aria-hidden="true">
                    {project.lead
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                  <div>
                    <strong>{project.lead}</strong>
                    <span>Today, 10:15</span>
                  </div>
                </div>
                <p>
                  {selectedChannel === "Decisions & Actions"
                    ? "Please record the stage decision and follow-up in the project decision log before the next review."
                    : selectedChannel === "Project Delivery"
                      ? "The handover review is ready. Please review the delivery plan before our next milestone."
                      : "Please review the current actions ahead of our next project check-in."}
                </p>
                <a
                  className="teams-project-attachment"
                  href={
                    selectedChannel === "Decisions & Actions"
                      ? `${root}/decisions`
                      : `${root}/documents?${new URLSearchParams({ library: "Project Documents", folder: "Planning/Delivery", file: `${project.code}-F1` })}`
                  }
                >
                  <DocumentIcon
                    name={
                      selectedChannel === "Decisions & Actions"
                        ? "Decision Log.xlsx"
                        : "Delivery Plan.xlsx"
                    }
                  />
                  {selectedChannel === "Decisions & Actions"
                    ? "Decisions & Actions"
                    : "Delivery Plan.xlsx"}
                </a>
                {projectReplies
                  .filter((p) => p.channel === selectedChannel)
                  .map((p, i) => (
                    <article
                      className="teams-thread-reply"
                      key={i}
                      aria-label={`Reply from ${person.name}`}
                    >
                      <span className="post-avatar small" aria-hidden="true">
                        {person.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                      <div className="thread-reply-body">
                        <header>
                          <strong>{person.name}</strong>
                          <span>Just now</span>
                        </header>
                        <p>{p.text}</p>
                      </div>
                    </article>
                  ))}
                {!readOnly && (
                  <div className="post-actions">
                    <button
                      aria-pressed={likedChannels.includes(selectedChannel)}
                      onClick={() =>
                        setLikedChannels(
                          likedChannels.includes(selectedChannel)
                            ? likedChannels.filter((c) => c !== selectedChannel)
                            : [...likedChannels, selectedChannel],
                        )
                      }
                    >
                      👍{" "}
                      {likedChannels.includes(selectedChannel)
                        ? "Liked"
                        : "Like"}
                    </button>
                    <button onClick={() => setReplyOpen(!replyOpen)}>
                      <Chat20Regular />
                      Reply
                    </button>
                  </div>
                )}
                {!readOnly && replyOpen && (
                  <TeamsComposer
                    compact
                    value={projectReply}
                    onChange={setProjectReply}
                    placeholder="Reply in thread"
                    onSend={() => {
                      if (!projectReply.trim()) return;
                      setProjectReplies([
                        ...projectReplies,
                        { channel: selectedChannel, text: projectReply.trim() },
                      ]);
                      setProjectReply("");
                      setReplyOpen(false);
                    }}
                  />
                )}
              </article>
              {projectPosts
                .filter((p) => p.channel === selectedChannel)
                .map((p, i) => (
                  <article className="teams-post" key={i}>
                    <div className="post-top">
                      <span className="post-avatar" aria-hidden="true">
                        {person.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                      <div>
                        <strong>{person.name}</strong>
                        <span>Just now</span>
                      </div>
                    </div>
                    <p>{p.text}</p>
                  </article>
                ))}
              {!readOnly && (
                <TeamsComposer
                  value={projectDraft}
                  onChange={setProjectDraft}
                  onSend={() => {
                    if (!projectDraft.trim()) return;
                    setProjectPosts([
                      ...projectPosts,
                      { channel: selectedChannel, text: projectDraft.trim() },
                    ]);
                    setProjectDraft("");
                  }}
                />
              )}
            </>
          )}
        </div>
      </TeamsShell>
    );
  }
  return (
    <div className="projects-app">
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
          <nav className="breadcrumb" aria-label="Project location">
            <a href="/projects">Projects</a>
            {project && (
              <>
                {" "}
                / <a href={root}>{project.code}</a>
              </>
            )}
          </nav>
          {searchResults || (project ? projectBody() : centralBody())}
        </main>
      </div>
    </div>
  );
}
